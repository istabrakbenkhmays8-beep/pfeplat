/**
 * Super-admin agent ("Avi"). Provider-agnostic: dispatches to Groq (OpenAI-compatible
 * tool calling) or Anthropic (tool_use / tool_result blocks) based on env.AI_PROVIDER.
 *
 * Each turn: read-only tools auto-run, mutating tools become Proposals that pause the
 * loop and wait for the super admin's Approve click in the UI.
 */
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "groq-sdk/resources/chat/completions";
import { Types } from "mongoose";
import { env } from "@/lib/env";
import { findTool, toolsForAnthropic, toolsForGroq } from "./agentTools";
import { isAiConfigured } from "./aiService";
import { connectDb } from "@/lib/db";
import { AIConversation, AuditLog } from "@/src/models";

/** Default model per provider — used when AI_MODEL isn't set in .env. */
const DEFAULT_MODELS = {
  groq: "llama-3.3-70b-versatile",
  anthropic: "claude-3-5-haiku-20241022",
} as const;

export type AgentMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; proposals?: Proposal[] };

export type Proposal = {
  /** Stable id local to this response — the UI uses it as a key. */
  id: string;
  /** Opaque tool-call id the provider gave us (Anthropic: tool_use_id, Groq: tool_call_id). */
  toolUseId: string;
  name: string;
  /** Human-readable description (the tool's static description). */
  description: string;
  input: Record<string, unknown>;
  /** Snapshot of the conversation up to and including this proposal — used by /execute to resume.
   *  Shape depends on the provider that created it; executeProposal switches on `provider`. */
  resumeContext: unknown[];
  /** Which provider created this proposal (so executeProposal knows how to resume). */
  provider: "groq" | "anthropic";
};

const SYSTEM_PROMPT = `You are "Avi", the operations agent for Advancia Training's super admin.

Your job is to help the super admin run the platform: surface what needs attention, search the catalog, and PROPOSE concrete management actions (create a course, assign a trainer, approve / reject reservations).

Hard rules:
- Read-only tools (get_overview_stats, list_pending_reservations, list_sessions_needing_trainer, search_courses, list_trainers) run immediately. Use them freely to gather context before proposing anything.
- Mutating tools (create_course, assign_trainer_to_session, approve_reservation, reject_reservation) are PROPOSALS — they do not run until the super admin clicks Approve in the UI. Treat each tool call you emit as a suggestion you're handing over for confirmation.
- Be specific. When you propose, fill in every required field with concrete values you've gathered from read-only tools. Never invent ids — look them up first.
- Be proactive: when the super admin says "what's next?", look at pending reservations + sessions without trainers + KPIs and suggest 2–3 concrete actions with one-line rationales.
- Keep prose short. Bullet what you found, then propose. Pleasantries are fine, but no fluff.

Tone: friendly, fast, direct. You're a power-user copilot, not a chatbot.`;

/* ------------------------- Provider clients ------------------------- */

let groqClient: Groq | null = null;
function getGroq(): Groq {
  if (groqClient) return groqClient;
  const key = env().AI_API_KEY;
  if (!key) throw new Error("AI_API_KEY not set");
  groqClient = new Groq({ apiKey: key });
  return groqClient;
}

let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (anthropicClient) return anthropicClient;
  // Prefer dedicated ANTHROPIC_API_KEY; fall back to AI_API_KEY when provider=anthropic.
  const key = env().ANTHROPIC_API_KEY || (env().AI_PROVIDER === "anthropic" ? env().AI_API_KEY : undefined);
  if (!key) throw new Error("ANTHROPIC_API_KEY not set (and AI_PROVIDER isn't anthropic)");
  anthropicClient = new Anthropic({ apiKey: key });
  return anthropicClient;
}

function getModel(): string {
  const e = env();
  return e.AI_MODEL?.trim() || DEFAULT_MODELS[e.AI_PROVIDER];
}

/* ------------------------- Public entry points ------------------------- */

/**
 * One agent turn. Loops the tool-use conversation until either:
 *   - the model emits a final answer with no tool calls (return reply, empty proposals), or
 *   - the model proposes at least one MUTATING tool call (stop, return reply + proposals).
 *
 * Read-only tool calls auto-execute inline and feed back to the model.
 */
export async function runAgent(opts: {
  history: AgentMessage[];
  userMessage: string;
  actorId: string;
}): Promise<{ reply: string; proposals: Proposal[]; conversationId: string }> {
  if (!isAiConfigured()) {
    return {
      reply:
        "I'm not configured yet. Ask an admin to set `AI_API_KEY` in `.env` and restart the server.",
      proposals: [],
      conversationId: "",
    };
  }

  const provider = env().AI_PROVIDER;
  const { reply, proposals } = provider === "groq" ? await runAgentGroq(opts) : await runAgentAnthropic(opts);

  // Persist the conversation summary (same shape regardless of provider).
  await connectDb();
  const convo = await AIConversation.create({
    user: new Types.ObjectId(opts.actorId),
    scope: "super_admin",
    title: opts.userMessage.slice(0, 80),
    messages: [
      { role: "user", content: opts.userMessage, toolCalls: [] },
      {
        role: "assistant",
        content: reply,
        toolCalls: proposals.map((p) => ({ name: p.name, args: p.input })),
      },
    ],
    lastMessageAt: new Date(),
  });

  return { reply, proposals, conversationId: String(convo._id) };
}

/**
 * Execute one proposed tool call after the super admin clicked Approve.
 * Resumes the conversation with the tool result so the model can give a follow-up
 * sentence ("done — the trainer has been notified"), then returns it to the UI.
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

  // Resume the conversation with the tool result so the model can wrap up.
  if (!isAiConfigured()) {
    return { ok: true, followUp: `Done. ${def.name} ran successfully.`, result };
  }

  try {
    // Default to current env provider if proposal didn't carry one (back-compat).
    const proposalProvider = opts.proposal.provider ?? env().AI_PROVIDER;
    const followUp =
      proposalProvider === "groq"
        ? await followUpGroq(opts.proposal, result)
        : await followUpAnthropic(opts.proposal, result);
    return { ok: true, followUp: followUp || `Done. ${def.name} ran successfully.`, result };
  } catch {
    return { ok: true, followUp: `Done. ${def.name} ran successfully.`, result };
  }
}

/* ------------------------- Groq implementation ------------------------- */

async function runAgentGroq(opts: {
  history: AgentMessage[];
  userMessage: string;
  actorId: string;
}): Promise<{ reply: string; proposals: Proposal[] }> {
  const groq = getGroq();
  const tools = toolsForGroq();

  // Groq/OpenAI puts the system prompt as the first message in the array.
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...opts.history
      .filter((m) => m.content.trim().length > 0)
      .map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: opts.userMessage },
  ];

  let finalText = "";
  const proposals: Proposal[] = [];

  for (let hop = 0; hop < 8; hop++) {
    const resp = await groq.chat.completions.create({
      model: getModel(),
      max_tokens: 1500,
      messages,
      tools,
      tool_choice: "auto",
    });
    const choice = resp.choices[0];
    if (!choice) break;
    const text = choice.message.content ?? "";
    const toolCalls: ChatCompletionMessageToolCall[] = choice.message.tool_calls ?? [];

    if (text.trim()) finalText = text.trim();

    if (toolCalls.length === 0) {
      // No tools requested — final answer.
      messages.push({ role: "assistant", content: text });
      break;
    }

    // Snapshot the assistant turn (with tool_calls) so /execute can resume cleanly.
    const assistantTurn: ChatCompletionMessageParam = {
      role: "assistant",
      content: text || null,
      tool_calls: toolCalls,
    };
    messages.push(assistantTurn);

    const autoResults: Array<{ tool_call_id: string; output: unknown }> = [];
    let stoppedForProposal = false;

    for (const tc of toolCalls) {
      if (tc.type !== "function") continue;
      const def = findTool(tc.function.name);
      let args: Record<string, unknown> = {};
      try {
        args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
      } catch {
        args = {};
      }

      if (!def) {
        autoResults.push({ tool_call_id: tc.id, output: { error: "UnknownTool", name: tc.function.name } });
        continue;
      }

      if (def.mutating) {
        proposals.push({
          id: `${Date.now()}-${proposals.length}`,
          toolUseId: tc.id,
          name: def.name,
          description: def.description,
          input: args,
          // resumeContext = the conversation up to *and including* the assistant turn that proposed.
          // /execute appends the tool result + continues.
          resumeContext: [...messages] as unknown[],
          provider: "groq",
        });
        stoppedForProposal = true;
      } else {
        try {
          const out = await def.execute(args, { actorId: opts.actorId });
          autoResults.push({ tool_call_id: tc.id, output: out });
          await AuditLog.create({
            actor: new Types.ObjectId(opts.actorId),
            actorRole: "super_admin",
            action: "ai.tool_invoked",
            targetType: "AgentTool",
            metadata: { tool: def.name, input: args },
          });
        } catch (err: any) {
          autoResults.push({ tool_call_id: tc.id, output: { error: err?.message ?? "ToolFailed" } });
        }
      }
    }

    if (stoppedForProposal) break;

    // Feed read-only results back as tool messages and loop.
    for (const r of autoResults) {
      messages.push({
        role: "tool",
        tool_call_id: r.tool_call_id,
        content: JSON.stringify(r.output).slice(0, 8000),
      });
    }
  }

  return { reply: finalText, proposals };
}

async function followUpGroq(proposal: Proposal, result: unknown): Promise<string> {
  const groq = getGroq();
  const tools = toolsForGroq();
  const messages = [
    ...(proposal.resumeContext as ChatCompletionMessageParam[]),
    {
      role: "tool" as const,
      tool_call_id: proposal.toolUseId,
      content: JSON.stringify(result).slice(0, 8000),
    },
  ];
  const resp = await groq.chat.completions.create({
    model: getModel(),
    max_tokens: 400,
    messages,
    tools,
    tool_choice: "auto",
  });
  return resp.choices[0]?.message.content?.trim() ?? "";
}

/* ------------------------- Anthropic implementation ------------------------- */

async function runAgentAnthropic(opts: {
  history: AgentMessage[];
  userMessage: string;
  actorId: string;
}): Promise<{ reply: string; proposals: Proposal[] }> {
  const anthropic = getAnthropic();

  const messages: Anthropic.Messages.MessageParam[] = opts.history
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content }));
  messages.push({ role: "user", content: opts.userMessage });

  let finalText = "";
  const proposals: Proposal[] = [];

  for (let hop = 0; hop < 8; hop++) {
    const resp = await anthropic.messages.create({
      model: getModel(),
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: toolsForAnthropic() as any,
      messages,
    });

    const textBlocks = resp.content.filter(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text",
    );
    const toolUses = resp.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );

    const textHere = textBlocks.map((b) => b.text).join("\n").trim();
    if (textHere) finalText = textHere;

    if (toolUses.length === 0) {
      messages.push({ role: "assistant", content: resp.content });
      break;
    }

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
          resumeContext: [...messages, { role: "assistant", content: resp.content }] as unknown[],
          provider: "anthropic",
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
          autoResults.push({ tool_use_id: tu.id, output: { error: err?.message ?? "ToolFailed" } });
        }
      }
    }

    if (stoppedForProposal) break;

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

  return { reply: finalText, proposals };
}

async function followUpAnthropic(proposal: Proposal, result: unknown): Promise<string> {
  const anthropic = getAnthropic();
  const messages = [
    ...(proposal.resumeContext as Anthropic.Messages.MessageParam[]),
    {
      role: "user" as const,
      content: [
        {
          type: "tool_result" as const,
          tool_use_id: proposal.toolUseId,
          content: JSON.stringify(result).slice(0, 8000),
        },
      ],
    },
  ];
  const resp = await anthropic.messages.create({
    model: getModel(),
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    tools: toolsForAnthropic() as any,
    messages,
  });
  return resp.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
