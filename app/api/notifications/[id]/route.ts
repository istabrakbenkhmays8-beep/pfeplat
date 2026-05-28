import { getSession } from "@/lib/session";
import { markAsRead } from "@/src/services/notificationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/notifications/:id
 *   Mark one notification as read. Idempotent (re-reading is a no-op).
 *   Quietly does nothing if the notification belongs to a different user.
 */
export async function PATCH(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await ctx.params;
  if (!id) return Response.json({ error: "MissingId" }, { status: 400 });

  const r = await markAsRead(session.user.id, id);
  return Response.json(r);
}
