import { z } from "zod";
import { Types } from "mongoose";
import { requireRole } from "@/lib/session";
import { decideReservation } from "@/src/services/reservationService";

export const runtime = "nodejs";

type RouteParams = Promise<{ id: string }>;

const schema = z.object({
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(600).optional(),
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

  const r = await decideReservation({
    reservationId: id,
    decision: parsed.data.decision,
    reviewerId: session.user.id,
    note: parsed.data.note,
  });
  if (!r.ok) return Response.json({ error: r.error }, { status: 404 });
  return Response.json(r);
}
