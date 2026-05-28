import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { AuditLog, Reservation, Session } from "@/src/models";

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

  return { ok: true as const };
}
