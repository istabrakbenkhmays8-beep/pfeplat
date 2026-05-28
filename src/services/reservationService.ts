import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { AuditLog, Reservation, Session, User } from "@/src/models";
import { createNotification, createNotifications } from "./notificationService";

export type ReservationListRow = {
  id: string;
  user: { id: string; name: string; email: string } | null;
  course: { code: string; title: string } | null;
  session: { startsAt: string; endsAt: string; mode: string; location?: string } | null;
  status: string;
  createdAt: string;
  reviewNote?: string;
};

export async function listReservations(status?: string): Promise<ReservationListRow[]> {
  await connectDb();
  const q: Record<string, unknown> = {};
  if (status && status !== "all") q.status = status;

  const rows = await Reservation.find(q)
    .populate("user", "firstName surname email")
    .populate({ path: "session", populate: { path: "course", select: "code title" } })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean<any[]>();

  return rows.map((r) => ({
    id: String(r._id),
    user: r.user
      ? {
          id: String(r.user._id),
          name: `${r.user.firstName ?? ""} ${r.user.surname ?? ""}`.trim() || r.user.email,
          email: r.user.email,
        }
      : null,
    course: r.session?.course
      ? { code: r.session.course.code, title: r.session.course.title }
      : null,
    session: r.session
      ? {
          startsAt: new Date(r.session.startsAt).toISOString(),
          endsAt: new Date(r.session.endsAt).toISOString(),
          mode: r.session.mode,
          location: r.session.location,
        }
      : null,
    status: r.status,
    createdAt: new Date(r.createdAt).toISOString(),
    reviewNote: r.reviewNote,
  }));
}

export type Decision = "approved" | "rejected";

export async function decideReservation(opts: {
  reservationId: string;
  decision: Decision;
  reviewerId: string;
  note?: string;
}) {
  await connectDb();
  const r = await Reservation.findById(new Types.ObjectId(opts.reservationId));
  if (!r) return { ok: false as const, error: "NotFound" as const };

  const previous = r.status;
  r.status = opts.decision;
  r.reviewedBy = new Types.ObjectId(opts.reviewerId);
  r.reviewedAt = new Date();
  r.reviewNote = opts.note;
  await r.save();

  if (opts.decision === "approved") {
    // Increment enrolledCount on the session.
    await Session.updateOne({ _id: r.session }, { $inc: { enrolledCount: 1 } });
  }

  await AuditLog.create({
    actor: new Types.ObjectId(opts.reviewerId),
    actorRole: "super_admin",
    action: opts.decision === "approved" ? "reservation.approved" : "reservation.rejected",
    targetType: "Reservation",
    targetId: r._id,
    before: { status: previous },
    after: { status: r.status },
    metadata: { note: opts.note },
  });

  // Fire-and-forget in-app notification to the learner. Pull the course code
  // so the title reads like "Reservation approved · CCNA" instead of an opaque id.
  try {
    const populated = await Reservation.findById(r._id).populate({
      path: "session",
      populate: { path: "course", select: "code title" },
    }).lean<any>();
    const courseCode = populated?.session?.course?.code ?? "your training";
    const courseTitle = populated?.session?.course?.title ?? "";
    const approved = opts.decision === "approved";
    await createNotification({
      userId: r.user,
      type: approved ? "reservation_approved" : "reservation_rejected",
      title: approved
        ? `Your seat is confirmed · ${courseCode}`
        : `Reservation declined · ${courseCode}`,
      body: approved
        ? `${courseTitle} — your seat has been approved. You'll receive session details by email.${opts.note ? ` Note from the team: ${opts.note}` : ""}`
        : `${courseTitle} — unfortunately we couldn't confirm this seat.${opts.note ? ` Reason: ${opts.note}` : " Please try another session."}`,
      link: "/my-courses",
      metadata: { reservationId: String(r._id), decision: opts.decision },
    });
  } catch (err) {
    // Don't fail the decision over a notification error.
    console.warn("[reservations] decideReservation notification failed:", err);
  }

  return { ok: true as const };
}

/**
 * User-initiated: request a seat for a session. Status starts as "pending"
 * (awaiting super admin approval). No payment is taken at this step.
 *
 * Validations:
 *   - session must exist + be upcoming
 *   - user must not already have a reservation on this session
 *   - session must not be at capacity (we count approved + pending, not just approved)
 *
 * Side effect: notifies every super_admin so the bell badge ticks up the
 * moment the user clicks.
 */
export async function createReservation(opts: {
  userId: string;
  sessionId: string;
}): Promise<{ ok: true; reservationId: string } | { ok: false; error: string }> {
  await connectDb();
  if (!Types.ObjectId.isValid(opts.sessionId)) return { ok: false, error: "InvalidSessionId" };

  const session = await Session.findById(opts.sessionId).populate("course", "code title");
  if (!session) return { ok: false, error: "SessionNotFound" };
  if (new Date(session.endsAt).getTime() < Date.now()) {
    return { ok: false, error: "SessionAlreadyEnded" };
  }

  // Existing reservation? (Unique index would throw, but this is a friendlier error.)
  const existing = await Reservation.findOne({
    user: new Types.ObjectId(opts.userId),
    session: session._id,
  }).select("_id status");
  if (existing) return { ok: false, error: "AlreadyReserved" };

  // Capacity check counts both pending and approved reservations so we don't
  // oversell while admins decide.
  const pendingPlusApproved = await Reservation.countDocuments({
    session: session._id,
    status: { $in: ["pending", "approved"] },
  });
  if (session.capacity > 0 && pendingPlusApproved >= session.capacity) {
    return { ok: false, error: "SessionFull" };
  }

  const r = await Reservation.create({
    user: new Types.ObjectId(opts.userId),
    session: session._id,
    status: "pending",
  });

  // Notify every super_admin so they see a new pending reservation immediately.
  try {
    const admins = await User.find({ role: { $in: ["super_admin", "admin"] }, status: "active" })
      .select("_id")
      .lean<any[]>();
    const c = session.course as unknown as { code?: string; title?: string } | undefined;
    await createNotifications(
      admins.map((a) => a._id),
      {
        type: "reservation_created",
        title: `New reservation request · ${c?.code ?? "session"}`,
        body: `A learner asked to join ${c?.title ?? "an upcoming session"}. Review and approve.`,
        link: "/super-admin/reservations",
        metadata: { reservationId: String(r._id), sessionId: String(session._id) },
      },
    );
  } catch (err) {
    console.warn("[reservations] createReservation notification failed:", err);
  }

  return { ok: true, reservationId: String(r._id) };
}
