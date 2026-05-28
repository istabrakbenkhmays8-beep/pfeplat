import { z } from "zod";
import { Types } from "mongoose";
import { requireRole } from "@/lib/session";
import { assignTrainer } from "@/src/services/trainerService";

export const runtime = "nodejs";

type RouteParams = Promise<{ id: string }>;

const schema = z.object({
  trainerId: z.string().min(1).nullable(),
});

export async function PATCH(req: Request, { params }: { params: RouteParams }) {
  const session = await requireRole("super_admin");
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return Response.json({ error: "InvalidId" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "ValidationError" }, { status: 400 });

  const r = await assignTrainer({
    sessionId: id,
    trainerId: parsed.data.trainerId,
    actorId: session.user.id,
  });
  if (!r.ok) {
    return Response.json({ error: r.error }, { status: r.error === "SessionNotFound" ? 404 : 400 });
  }
  return Response.json(r);
}
