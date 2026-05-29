import { z } from "zod";
import { requireRole } from "@/lib/session";
import { createReservation } from "@/src/services/reservationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/reservations
 *   body: { sessionId: string }
 *
 * Learner-initiated. Creates a reservation in `pending` status and pings
 * super admins via the in-app notification bell.
 */
const schema = z.object({
  sessionId: z.string().min(1, "sessionId required"),
});

export async function POST(req: Request) {
  const session = await requireRole("user");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "ValidationError" }, { status: 400 });

  const r = await createReservation({
    userId: session.user.id,
    sessionId: parsed.data.sessionId,
  });
  if (!r.ok) {
    return Response.json({ error: r.error }, { status: 400 });
  }
  return Response.json(r);
}
