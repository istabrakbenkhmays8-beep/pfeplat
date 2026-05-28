import Anthropic from "@anthropic-ai/sdk";
import { Types } from "mongoose";
import { env } from "@/lib/env";
import { findTool, toolsForAnthropic } from "./agentTools";
import { isAiConfigured } from "./aiService";
import { connectDb } from "@/lib/db";
import { AIConversation, AuditLog } from "@/src/models";

export type AgentMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; proposals?: Proposal[] };

export type Proposal = {
  /** Stable id local to this response — the UI uses it as a key. */
  id: string;
  /** Anthropic's tool_use_id — we need this to send the tool_result back when executing. */
  toolUseId: string;
  name: string;
  /** Human-readable description (the tool's static description). */
  description: string;
  input: Record<string, unknown>;
  /** Snapshot of the agent's conversation up to and including this proposal — used by /execute to resume. */
  resumeContext: Anthropic.Messages.MessageParam[];
};

const SYSTEM_PROMPT = `You are "Avi", the operations agent for Advancia Training's super admin.

Your job is to help the super admin run the platform: surface what needs attention, search the catalog, and PROPOSE concrete management actions (create a course, assign a trainer, approve / reject reservations).

Hard rules:
- Read-only tools (get_overview_stats, list_pending_reservations, list_sessions_needing_trainer, search_courses, list_trainers) run immediately. Use them freely to gather context before proposing anything.
- Mutating tools (create_course, assign_trainer_to_session, approve_reservation, reject_reservation) are PROPOSALS — they do not run until the super admin clicks Approve in the UI. Treat each tool_use you emit as a suggestion you're handing over for confirmation.
- Be specific. When you propose, fill in every required field with concrete values you've gathered from read-only tools. Never invent ids — look them up first.
- Be proactive: when the super admin says "what's next?", look at pending reservations + sessions without trainers + KPIs and suggest 2–3 concrete actions with one-line rationales.
- Keep prose short. Bullet what you found, then propose. Pleasantries are fine, but no fluff.

Tone: friendly, fast, direct. You're a power-user copilot, not a chatbot.`;

let client: Anthropic | null = null;
function getClient() {
  if (client) return client;
  const key = env().ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");
  client = new Anthropic({ apiKey: key });
  return client;
}

/**
 * One agent turn: take the existing history + the new user message, loop the tool-use
 * conversation until the model has either:
 *   - emitted a final assistant message with no tool_use (we return reply + no proposals), or
 *   - emitted at least one MUTATING tool_use (we stop, return reply text + proposals).
 *
 * Read-only tool_use blocks are auto-executed and fed back to the model.
 */
export async function runAgent(opts: {
  history: AgentMessage[];
  userMessage: string;
  actorId: string;
}): Promise<{ reply: string; proposals: Proposal[]; conversationId: string }> {
  if (!isAiConfigured()) {
    return {
      reply:
        "I'm not configured yet. Ask an admin to set `ANTHROPIC_API_KEY` in `.env` and restart the server.",
      proposals: [],
      conversationId: "",
    };
  }

  const anthropic = getClient();

  // Translate our history into Anthropic message shape. We don't replay prior tool_use
  // blocks — they were one-shot proposals tied to a previous turn.
  const messages: Anthropic.Messages.MessageParam[] = opts.history
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));
  messages.push({ role: "user", content: opts.userMessage });

  let finalText = "";
  const proposals: Proposal[] = [];

  // Tool loop. We cap at 8 hops to avoid runaway loops.
  for (let hop = 0; hop < 8; hop++) {
    const resp = await anthropic.messages.create({
      model: env().ANTHROPIC_MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: toolsForAnthropic() as any,
      messages,
    });

    // Pull text + tool_use blocks out of this response.
    const textBlocks = resp.content.filter(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text",
    );
    const toolUses = resp.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );

    const textHere = textBlocks.map((b) => b.text).join("\n").trim();
    if (textHere) finalText = textHere;

    if (toolUses.length === 0) {
      // No tools requested — we're done.
      messages.push({ role: "assistant", content: resp.content });
      break;
    }

    // Split tool calls into auto (read-only) and proposals (mutating).
    const autoResults: Array<{ tool_use_id: string; output: unknown }> = [];
    let stoppedForProposal = false;

    for (const tu of toolUses) {
      const def = findTool(tu.name);
      if (!def) {
        autoResults.push({ tool_use_id: tu.id, output: { error: "UnknownTool", name: tu.name } });
        continue;
      }
      if (def.mutating) {
        proposals.push({
          id: `${Date.now()}-${proposals.length}`,
          toolUseId: tu.id,
          name: def.name,
          description: def.description,
          input: (tu.input as Record<string, unknown>) ?? {},
          // resumeContext is the conversation up to *just before* this proposal hop;
          // /execute will append the assistant turn + tool_result and continue.
          resumeContext: [...messages, { role: "assistant", content: resp.content }],
        });
        stoppedForProposal = true;
      } else {
        try {
          const out = await def.execute(
            (tu.input as Record<string, unknown>) ?? {},
            { actorId: opts.actorId },
          );
          autoResults.push({ tool_use_id: tu.id, output: out });
          await AuditLog.create({
            actor: new Types.ObjectId(opts.actorId),
            actorRole: "super_admin",
            action: "ai.tool_invoked",
            targetType: "AgentTool",
            metadata: { tool: def.name, input: tu.input },
          });
        } catch (err: any) {
          autoResults.push({
            tool_use_id: tu.id,
            output: { error: err?.message ?? "ToolFailed" },
          });
        }
      }
    }

    if (stoppedForProposal) {
      // We can't continue the loop until the user approves — bail out with what we have.
      break;
    }

    // Feed read-only results back to the model and continue the loop.
    messages.push({ role: "assistant", content: resp.content });
    messages.push({
      role: "user",
      content: autoResults.map((r) => ({
        type: "tool_result" as const,
        tool_use_id: r.tool_use_id,
        content: JSON.stringify(r.output).slice(0, 8000),
      })),
    });
  }

  // Persist the conversation.
  await connectDb();
  const convo = await AIConversation.create({
    user: new Types.ObjectId(opts.actorId),
    scope: "super_admin",
    title: opts.userMessage.slice(0, 80),
    messages: [
      { role: "user", content: opts.userMessage, toolCalls: [] },
      {
        role: "assistant",
        content: finalText,
        toolCalls: proposals.map((p) => ({ name: p.name, args: p.input })),
      },
    ],
    lastMessageAt: new Date(),
  });

  return { reply: finalText, proposals, conversationId: String(convo._id) };
}

/**
 * Execute a single proposed tool call after the super admin has clicked Approve.
 * Sends the tool_result back to Anthropic so the model can give a follow-up sentence
 * ("done — the trainer has been notified"), then returns that sentence to the UI.
 */
export async function executeProposal(opts: {
  proposal: Proposal;
  actorId: string;
}): Promise<{ ok: true; followUp: string; result: unknown } | { ok: false; error: string }> {
  const def = findTool(opts.proposal.name);
  if (!def) return { ok: false, error: "UnknownTool" };
  if (!def.mutating) return { ok: false, error: "NotMutating" };

  let result: unknown;
  try {
    result = await def.execute(opts.proposal.input, { actorId: opts.actorId });
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "ToolFailed" };
  }

  await AuditLog.create({
    actor: new Types.ObjectId(opts.actorId),
    actorRole: "super_admin",
    action: "ai.action_executed",
    targetType: "AgentTool",
    metadata: { tool: def.name, input: opts.proposal.input, result },
  });

  // Resume the conversation with the tool_result so the model can wrap up.
  if (!isAiConfigured()) {
    return { ok: true, followUp: `Done. ${def.name} ran successfully.`, result };
  }

  try {
    const anthropic = getClient();
    const messages = [
      ...opts.proposal.resumeContext,
      {
        role: "user" as const,
        content: [
          {
            type: "tool_result" as const,
            tool_use_id: opts.proposal.toolUseId,
            content: JSON.stringify(result).slice(0, 8000),
          },
        ],
      },
    ];
    const resp = await anthropic.messages.create({
      model: env().ANTHROPIC_MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      tools: toolsForAnthropic() as any,
      messages,
    });
    const txt = resp.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return {
      ok: true,
      followUp: txt || `Done. ${def.name} ran successfully.`,
      result,
    };
  } catch {
    return { ok: true, followUp: `Done. ${def.name} ran successfully.`, result };
  }
}
