import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { Notification, type NotificationType } from "@/src/models";

export type NotificationRow = {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  readAt: string | null;
  createdAt: string;
};

/**
 * Create one in-app notification. Caller is whatever service made the decision
 * (e.g. `decideReservation` calls this after approving/rejecting).
 *
 * Failure is swallowed (logged) — never let a notification crash a business
 * action like "approve reservation". The audit log is the source of truth.
 */
export async function createNotification(opts: {
  userId: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await connectDb();
    const n = await Notification.create({
      user: typeof opts.userId === "string" ? new Types.ObjectId(opts.userId) : opts.userId,
      type: opts.type,
      title: opts.title,
      body: opts.body,
      link: opts.link,
      metadata: opts.metadata,
    });
    return { ok: true, id: String(n._id) };
  } catch (err: any) {
    console.warn("[notifications] createNotification failed:", err?.message ?? err);
    return { ok: false, error: err?.message ?? "Unknown" };
  }
}

/**
 * Broadcast the same notification to many users at once (e.g. notify every
 * admin when a new reservation lands). Failures are tallied but not thrown.
 */
export async function createNotifications(
  userIds: Array<string | Types.ObjectId>,
  payload: { type: NotificationType; title: string; body?: string; link?: string; metadata?: Record<string, unknown> },
) {
  await connectDb();
  if (userIds.length === 0) return { ok: true as const, created: 0 };
  const docs = userIds.map((u) => ({
    user: typeof u === "string" ? new Types.ObjectId(u) : u,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    link: payload.link,
    metadata: payload.metadata,
  }));
  try {
    const r = await Notification.insertMany(docs, { ordered: false });
    return { ok: true as const, created: r.length };
  } catch (err: any) {
    console.warn("[notifications] createNotifications failed:", err?.message ?? err);
    return { ok: false as const, created: 0, error: err?.message ?? "Unknown" };
  }
}

/** List the most recent N notifications for a user. Newest first. */
export async function listForUser(userId: string, opts?: { limit?: number; unreadOnly?: boolean }): Promise<NotificationRow[]> {
  await connectDb();
  const q: Record<string, unknown> = { user: new Types.ObjectId(userId) };
  if (opts?.unreadOnly) q.readAt = null;
  const rows = await Notification.find(q)
    .sort({ createdAt: -1 })
    .limit(opts?.limit ?? 30)
    .lean<any[]>();
  return rows.map((r) => ({
    id: String(r._id),
    type: r.type,
    title: r.title,
    body: r.body,
    link: r.link,
    readAt: r.readAt ? new Date(r.readAt).toISOString() : null,
    createdAt: new Date(r.createdAt).toISOString(),
  }));
}

/** Count unread for the bell badge. Fast, indexed. */
export async function unreadCount(userId: string): Promise<number> {
  await connectDb();
  return Notification.countDocuments({
    user: new Types.ObjectId(userId),
    readAt: null,
  });
}

/** Mark one notification as read. No-op if it doesn't belong to this user. */
export async function markAsRead(userId: string, notificationId: string) {
  await connectDb();
  await Notification.updateOne(
    { _id: new Types.ObjectId(notificationId), user: new Types.ObjectId(userId), readAt: null },
    { $set: { readAt: new Date() } },
  );
  return { ok: true as const };
}

/** Mark every unread notification for this user as read. */
export async function markAllAsRead(userId: string) {
  await connectDb();
  const r = await Notification.updateMany(
    { user: new Types.ObjectId(userId), readAt: null },
    { $set: { readAt: new Date() } },
  );
  return { ok: true as const, updated: r.modifiedCount };
}
