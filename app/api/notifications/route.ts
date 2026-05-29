import { z } from "zod";
import { getSession } from "@/lib/session";
import { listForUser, markAllAsRead, unreadCount } from "@/src/services/notificationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 *   ?unreadOnly=1     → only unread
 *   ?limit=20         → cap (default 30, max 50)
 *
 * Returns: { items: [...], unreadCount: number }
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get("unreadOnly") === "1";
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 30) || 30, 1), 50);

  const [items, count] = await Promise.all([
    listForUser(session.user.id, { unreadOnly, limit }),
    unreadCount(session.user.id),
  ]);

  return Response.json({ items, unreadCount: count });
}

/**
 * POST /api/notifications
 *   body: { action: "mark_all_read" }
 *
 * Currently the only POST action. We use POST (not DELETE) because the
 * notifications still exist — they're just flagged as read.
 */
const postSchema = z.object({ action: z.literal("mark_all_read") });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "ValidationError" }, { status: 400 });

  const r = await markAllAsRead(session.user.id);
  return Response.json(r);
}
