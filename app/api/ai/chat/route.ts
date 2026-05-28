import { z } from "zod";
import { getSession } from "@/lib/session";
import {
  appendMessages,
  ensureConversation,
  isAiConfigured,
  streamChat,
} from "@/src/services/aiService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  conversationId: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(40),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  if (!isAiConfigured()) {
    return Response.json(
      {
        error: "AINotConfigured",
        message: "Set AI_API_KEY in .env to enable the assistant (Groq: gsk_..., Anthropic: sk-ant-...).",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "ValidationError" }, { status: 400 });
  }

  const scope =
    session.user.role === "super_admin"
      ? "super_admin"
      : session.user.role === "admin"
      ? "admin"
      : "user";

  const convo = await ensureConversation(session.user.id, scope, parsed.data.conversationId);
  const userMsg = parsed.data.messages[parsed.data.messages.length - 1];

  // Persist the new user message before streaming.
  if (userMsg?.role === "user") {
    await appendMessages(String(convo._id), [userMsg]);
  }

  const { stream } = await streamChat({
    scope,
    userId: session.user.id,
    history: parsed.data.messages,
  });

  const encoder = new TextEncoder();
  let assistantText = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        // Send conversationId first as a small JSON line so the client can attach it.
        controller.enqueue(
          encoder.encode(`event: meta\ndata: ${JSON.stringify({ conversationId: String(convo._id) })}\n\n`),
        );

        // streamChat now yields a normalized `{ text }` shape regardless of provider
        // (Groq or Anthropic), so the route handler is provider-agnostic.
        for await (const chunk of stream) {
          const piece = chunk.text;
          if (!piece) continue;
          assistantText += piece;
          controller.enqueue(
            encoder.encode(`event: token\ndata: ${JSON.stringify({ token: piece })}\n\n`),
          );
        }

        // Persist the assistant message at the end.
        if (assistantText.trim()) {
          await appendMessages(String(convo._id), [{ role: "assistant", content: assistantText }]);
        }
        controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({})}\n\n`));
      } catch (err: any) {
        console.error("[ai] stream error", err);
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ message: err?.message ?? "stream failed" })}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}

export async function GET() {
  return Response.json({ configured: isAiConfigured() });
}
