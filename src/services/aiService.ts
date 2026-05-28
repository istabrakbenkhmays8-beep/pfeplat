import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { env } from "@/lib/env";
import { listUserEnrollments } from "./enrollmentService";
import { AIConversation, User } from "@/src/models";
import type { AiScope } from "@/src/models";

/** Default model when AI_MODEL isn't set — one per provider. */
const DEFAULT_MODELS = {
  groq: "llama-3.3-70b-versatile",
  anthropic: "claude-3-5-haiku-20241022",
} as const;

/** True iff the user chatbot has an API key it can use. */
export function isAiConfigured(): boolean {
  const e = env();
  if (e.AI_API_KEY) return true;
  // Backwards compat: legacy ANTHROPIC_API_KEY-only setups still work when
  // AI_PROVIDER is anthropic.
  if (e.AI_PROVIDER === "anthropic" && e.ANTHROPIC_API_KEY) return true;
  return false;
}

function getApiKey(): string {
  const e = env();
  if (e.AI_API_KEY) return e.AI_API_KEY;
  if (e.AI_PROVIDER === "anthropic" && e.ANTHROPIC_API_KEY) return e.ANTHROPIC_API_KEY;
  throw new Error(
    "No AI API key configured. Set AI_API_KEY in .env (Groq: gsk_..., Anthropic: sk-ant-...).",
  );
}

function getModel(): string {
  const e = env();
  return e.AI_MODEL?.trim() || DEFAULT_MODELS[e.AI_PROVIDER];
}

let groqClient: Groq | null = null;
function getGroq(): Groq {
  if (groqClient) return groqClient;
  groqClient = new Groq({ apiKey: getApiKey() });
  return groqClient;
}

let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (anthropicClient) return anthropicClient;
  anthropicClient = new Anthropic({ apiKey: getApiKey() });
  return anthropicClient;
}

const SYSTEM_PROMPTS: Record<AiScope, string> = {
  user: `You are "Ada", the friendly Advancia Training learning assistant.
You help one specific learner understand their progress, recommend next courses, explain certifications,
and answer learning-related questions. You are warm, plain-spoken, and never use jargon.
You have read-only access to the learner's enrollments, coins balance, and certificate history (shown in the
context block below). If the user asks something off-topic, gently steer back to learning.
Always reply in the same language the learner is using (English, French, or Arabic). Keep replies short
and practical: 2–4 short paragraphs max, with simple lists when useful.`,
  admin: `You are "Adi", the Advancia Training admin assistant. You help platform admins find what to do next:
courses missing a category, pending verifications, recent enrollments. You suggest concrete actions and link to
relevant pages. You never perform destructive actions; you only advise.`,
  super_admin: `You are "Avi", the Advancia Training operations agent. You help the super admin run the platform.
For now, you advise and surface KPIs. Mutating actions require explicit human approval before execution.`,
};

export async function buildUserContext(userId: string): Promise<string> {
  await connectDb();
  const uid = new Types.ObjectId(userId);
  const [user, enrollments] = await Promise.all([
    User.findById(uid).select("firstName surname email country level walletCoins").lean<any>(),
    listUserEnrollments(userId),
  ]);
  if (!user) return "(no user context)";
  const lines: string[] = [];
  lines.push(`Learner: ${user.firstName} ${user.surname} (${user.email})`);
  if (user.country) lines.push(`Country: ${user.country}`);
  lines.push(`Level: ${user.level ?? "beginner"}`);
  lines.push(`Wallet: ${user.walletCoins ?? 0} coins`);
  if (enrollments.length === 0) {
    lines.push(`Enrollments: none yet.`);
  } else {
    lines.push(`Enrollments (${enrollments.length}):`);
    for (const e of enrollments.slice(0, 20)) {
      lines.push(
        `- [${e.status}] ${e.course.code} ${e.course.title} (${e.course.vendor}, ${e.course.durationDays}d) — ${e.progress}% complete${e.completedAt ? ` · completed ${e.completedAt.slice(0, 10)}` : ""}`,
      );
    }
  }
  return lines.join("\n");
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Normalized chunk yielded by streamChat — provider-agnostic. */
export type StreamChunk = { text: string };

/**
 * Stream a chat response. Internally dispatches to Groq (OpenAI-compatible) or
 * Anthropic based on env.AI_PROVIDER, but yields a single normalized
 * `{ text: string }` shape so route handlers don't need to know the provider.
 */
export async function streamChat({
  scope,
  userId,
  history,
  conversationId,
}: {
  scope: AiScope;
  userId: string;
  history: ChatMessage[];
  conversationId?: string;
}): Promise<{ stream: AsyncIterable<StreamChunk>; conversationId?: string }> {
  const system =
    SYSTEM_PROMPTS[scope] +
    (scope === "user" ? `\n\n--- LEARNER CONTEXT ---\n${await buildUserContext(userId)}` : "");

  const provider = env().AI_PROVIDER;
  const stream = provider === "groq" ? streamChatGroq({ system, history }) : streamChatAnthropic({ system, history });
  return { stream, conversationId };
}

async function* streamChatGroq({
  system,
  history,
}: {
  system: string;
  history: ChatMessage[];
}): AsyncGenerator<StreamChunk> {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: system },
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
    stream: true,
    max_tokens: 1024,
    temperature: 0.7,
  });
  for await (const chunk of completion) {
    const text = chunk.choices?.[0]?.delta?.content;
    if (text) yield { text };
  }
}

async function* streamChatAnthropic({
  system,
  history,
}: {
  system: string;
  history: ChatMessage[];
}): AsyncGenerator<StreamChunk> {
  const anthropic = getAnthropic();
  const stream = anthropic.messages.stream({
    model: getModel(),
    max_tokens: 1024,
    system,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });
  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      yield { text: chunk.delta.text };
    }
  }
}

export async function ensureConversation(userId: string, scope: AiScope, conversationId?: string) {
  await connectDb();
  const uid = new Types.ObjectId(userId);
  if (conversationId && Types.ObjectId.isValid(conversationId)) {
    const c = await AIConversation.findOne({ _id: conversationId, user: uid });
    if (c) return c;
  }
  return AIConversation.create({ user: uid, scope, messages: [], lastMessageAt: new Date() });
}

export async function appendMessages(
  conversationId: string,
  msgs: Array<{ role: "user" | "assistant"; content: string }>,
) {
  await AIConversation.updateOne(
    { _id: conversationId },
    {
      $push: { messages: { $each: msgs.map((m) => ({ role: m.role, content: m.content, toolCalls: [] })) } },
      $set: { lastMessageAt: new Date() },
    },
  );
}
