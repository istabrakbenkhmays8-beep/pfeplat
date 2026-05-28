import { Types } from "mongoose";
import { requireRole } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { Enrollment, Reservation, Session } from "@/src/models";
import { CalendarView, type SessionRow } from "./CalendarView";

export const metadata = { title: "Your training calendar" };
export const dynamic = "force-dynamic";

/**
 * Build the calendar dataset for the signed-in user:
 *   - every upcoming session (future or in-progress),
 *   - annotated with whether THIS user is enrolled in the course or has a reservation for the session.
 *
 * We send all sessions to the client view so it can render the full month grid + apply filters
 * (Mine / All / Online / On-site) without a server round-trip.
 */
async function loadCalendarForUser(userId: string): Promise<SessionRow[]> {
  await connectDb();
  const uid = new Types.ObjectId(userId);
  const now = new Date();

  const [enrollments, reservations, sessions] = await Promise.all([
    Enrollment.find({ user: uid }).select("course status").lean(),
    Reservation.find({ user: uid }).select("session status").lean(),
    Session.find({ endsAt: { $gte: now } })
      .populate({ path: "course", populate: { path: "category" } })
      .sort({ startsAt: 1 })
      .lean(),
  ]);

  const enrolledCourseIds = new Set(enrollments.map((e: any) => String(e.course)));
  const reservationBySession = new Map<string, { status: string }>(
    reservations.map((r: any) => [String(r.session), { status: r.status }]),
  );

  return sessions
    .filter((s: any) => s.course)
    .map((s: any) => ({
      id: String(s._id),
      courseCode: s.course.code,
      courseTitle: s.course.title,
      vendor: s.course.category?.vendor ?? "",
      group: s.course.category?.group ?? "",
      durationDays: s.course.durationDays ?? 0,
      mode: s.mode,
      status: s.status,
      startsAt: new Date(s.startsAt).toISOString(),
      endsAt: new Date(s.endsAt).toISOString(),
      location: s.location ?? null,
      meetingLink: s.meetingLink ?? null,
      capacity: s.capacity,
      enrolledCount: s.enrolledCount,
      reservation: reservationBySession.get(String(s._id)) ?? null,
      enrolled: enrolledCourseIds.has(String(s.course._id)),
    }));
}

export default async function UserCalendarPage() {
  const session = await requireRole("user");
  const rows = await loadCalendarForUser(session.user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Your training calendar</h1>
        <p className="text-sm text-muted-foreground">
          Sessions for the courses you&rsquo;ve enrolled in or reserved, plus everything else coming up. Click a day to
          see what&rsquo;s scheduled.
        </p>
      </header>

      <CalendarView rows={rows} />
    </div>
  );
}
