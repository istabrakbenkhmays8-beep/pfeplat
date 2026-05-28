import Anthropic from "@anthropic-ai/sdk";
import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { env } from "@/lib/env";
import { listUserEnrollments } from "./enrollmentService";
import { AIConversation, User } from "@/src/models";
import type { AiScope } from "@/src/models";

export function isAiConfigured(): boolean {
  return !!env().ANTHROPIC_API_KEY;
}

let client: Anthropic | null = null;
function getClient() {
  if (client) return client;
  const key = env().ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");
  client = new Anthropic({ apiKey: key });
  return client;
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
}) {
  const anthropic = getClient();
  const system =
    SYSTEM_PROMPTS[scope] +
    (scope === "user" ? `\n\n--- LEARNER CONTEXT ---\n${await buildUserContext(userId)}` : "");

  const stream = anthropic.messages.stream({
    model: env().ANTHROPIC_MODEL,
    max_tokens: 1024,
    system,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  return { stream, conversationId };
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
