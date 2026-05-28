import { z } from "zod";
import { getSession } from "@/lib/session";
import { submitQuiz } from "@/src/services/assessmentService";

export const runtime = "nodejs";

const schema = z.object({
  assessmentId: z.string().length(24),
  startedAt: z.coerce.date().optional(),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOptionIds: z.array(z.string().min(1)).max(10),
      }),
    )
    .max(200),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthenticated" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "ValidationError" }, { status: 400 });

  const r = await submitQuiz({
    userId: session.user.id,
    assessmentId: parsed.data.assessmentId,
    answers: parsed.data.answers,
    startedAt: parsed.data.startedAt,
  });
  if (!r.ok) return Response.json({ error: r.error }, { status: 400 });
  return Response.json(r);
}
