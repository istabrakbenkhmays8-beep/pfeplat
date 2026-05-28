import { z } from "zod";
import { requireRole } from "@/lib/session";
import { runAgent, type AgentMessage } from "@/src/services/agentService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().trim().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      }),
    )
    .max(20)
    .default([]),
});

export async function POST(req: Request) {
  const session = await requireRole("super_admin");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "ValidationError" }, { status: 400 });

  try {
    const result = await runAgent({
      history: parsed.data.history as AgentMessage[],
      userMessage: parsed.data.message,
      actorId: session.user.id,
    });
    return Response.json(result);
  } catch (err: any) {
    console.error("[agent] runAgent failed", err);
    return Response.json({ error: "AgentFailed", message: err?.message ?? "unknown" }, { status: 500 });
  }
}
