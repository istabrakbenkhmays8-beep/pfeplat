import { connectDb } from "@/lib/db";
import {
  AuditLog,
  Category,
  CoinTransaction,
  Course,
  Enrollment,
  Payment,
  Reservation,
  Session,
  Trainer,
  User,
} from "@/src/models";

export type WeekPoint = { week: string; enrollments: number; completions: number };
export type VendorPoint = { vendor: string; courses: number };
export type GroupPoint = { group: string; courses: number };
export type SignupPoint = { week: string; signups: number };
export type RoleSlice = { role: string; users: number };
export type RevenuePoint = { week: string; revenueTnd: number };
export type CoinFlowPoint = { week: string; earned: number; spent: number };
export type SuperAdminPulse = {
  totalUsers: number;
  totalAdmins: number;
  totalSuperAdmins: number;
  totalLearners: number;
  activeLearners: number;
  pendingVerification: number;
  totalCourses: number;
  publishedCourses: number;
  totalSessions: number;
  sessionsNext7d: number;
  sessionsWithoutTrainer: number;
  pendingReservations: number;
  approvedReservationsMonth: number;
  totalEnrollments: number;
  completionRate: number;
  certificatesMonth: number;
  paymentsMonth: number;
  revenueMonthTnd: number;
  failedPayments24h: number;
  totalCoinsInCirculation: number;
  totalCoinsEarnedMonth: number;
  totalCoinsSpentMonth: number;
  auditEvents24h: number;
  auditEvents7d: number;
  newUsersToday: number;
  trainerCount: number;
};
export type AuditEntry = {
  _id: string;
  action: string;
  actorRole?: string;
  targetType?: string;
  at: string;
  actor?: { firstName?: string; surname?: string; email?: string };
};
export type PendingItem =
  | { kind: "reservation"; id: string; user: string; course: string; at: string }
  | { kind: "session"; id: string; course: string; startsAt: string };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function weekKey(d: Date): string {
  // Monday-aligned ISO-ish week, formatted "DD MMM".
  const day = (d.getUTCDay() + 6) % 7;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - day);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
}

/** Last 8 weeks of enrollment + completion activity. */
export async function enrollmentTrend(): Promise<WeekPoint[]> {
  await connectDb();
  const now = new Date();
  const since = new Date(now.getTime() - 8 * WEEK_MS);

  const rows = await Enrollment.find({ createdAt: { $gte: since } })
    .select("createdAt status completedAt")
    .lean<{ createdAt: Date; status: string; completedAt?: Date }[]>();

  const buckets = new Map<string, WeekPoint>();
  // Pre-seed 8 buckets in chronological order so the chart doesn't have gaps.
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getTime() - i * WEEK_MS);
    const k = weekKey(d);
    if (!buckets.has(k)) buckets.set(k, { week: k, enrollments: 0, completions: 0 });
  }

  for (const r of rows) {
    const k = weekKey(new Date(r.createdAt));
    const b = buckets.get(k);
    if (b) b.enrollments += 1;
    if (r.status === "completed" && r.completedAt) {
      const kc = weekKey(new Date(r.completedAt));
      const bc = buckets.get(kc);
      if (bc) bc.completions += 1;
    }
  }

  return Array.from(buckets.values());
}

export async function coursesByVendor(): Promise<VendorPoint[]> {
  await connectDb();
  const rows = await Course.aggregate([
    { $match: { isPublished: true } },
    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" } },
    { $unwind: "$cat" },
    { $group: { _id: "$cat.vendor", count: { $sum: 1 } } },
    { $project: { _id: 0, vendor: "$_id", courses: "$count" } },
    { $sort: { courses: -1 } },
  ]);
  return rows;
}

export async function coursesByGroup(): Promise<GroupPoint[]> {
  await connectDb();
  const rows = await Course.aggregate([
    { $match: { isPublished: true } },
    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" } },
    { $unwind: "$cat" },
    { $group: { _id: "$cat.group", count: { $sum: 1 } } },
    { $project: { _id: 0, group: "$_id", courses: "$count" } },
    { $sort: { courses: -1 } },
  ]);
  return rows;
}

export async function categoryCount() {
  await connectDb();
  return Category.countDocuments();
}

/* ------------------------------------------------------------------ */
/*  Super-admin analytics                                             */
/* ------------------------------------------------------------------ */

/** One-shot pulse aggregation — every headline metric the super-admin sees on first load. */
export async function superAdminPulse(): Promise<SuperAdminPulse> {
  await connectDb();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const next7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalAdmins,
    totalSuperAdmins,
    totalLearners,
    activeLearners,
    pendingVerification,
    totalCourses,
    publishedCourses,
    totalSessions,
    sessionsNext7d,
    sessionsWithoutTrainer,
    pendingReservations,
    approvedReservationsMonth,
    totalEnrollments,
    completedEnrollments,
    certificatesMonth,
    paymentsMonth,
    revenueAgg,
    failedPayments24h,
    coinSumAgg,
    coinFlowMonthAgg,
    auditEvents24h,
    auditEvents7d,
    newUsersToday,
    trainerCount,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "super_admin" }),
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", status: "active" }),
    User.countDocuments({ status: "pending_verification" }),
    Course.countDocuments({}),
    Course.countDocuments({ isPublished: true }),
    Session.countDocuments({}),
    Session.countDocuments({ startsAt: { $gte: now, $lte: next7d } }),
    Session.countDocuments({ trainer: { $exists: false }, startsAt: { $gte: now } }),
    Reservation.countDocuments({ status: "pending" }),
    Reservation.countDocuments({ status: "approved", updatedAt: { $gte: startOfMonth } }),
    Enrollment.countDocuments({}),
    Enrollment.countDocuments({ status: "completed" }),
    Enrollment.countDocuments({ status: "completed", completedAt: { $gte: startOfMonth } }),
    Payment.countDocuments({ status: "succeeded", createdAt: { $gte: startOfMonth } }),
    Payment.aggregate([
      { $match: { status: "succeeded", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amountTnd" } } },
    ]),
    Payment.countDocuments({ status: "failed", createdAt: { $gte: since24h } }),
    User.aggregate([{ $group: { _id: null, total: { $sum: "$walletCoins" } } }]),
    CoinTransaction.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          earned: { $sum: { $cond: [{ $gt: ["$delta", 0] }, "$delta", 0] } },
          spent: { $sum: { $cond: [{ $lt: ["$delta", 0] }, { $abs: "$delta" }, 0] } },
        },
      },
    ]),
    AuditLog.countDocuments({ createdAt: { $gte: since24h } }),
    AuditLog.countDocuments({ createdAt: { $gte: since7d } }),
    User.countDocuments({ createdAt: { $gte: startOfDay } }),
    Trainer.countDocuments({}),
  ]);

  return {
    totalUsers,
    totalAdmins,
    totalSuperAdmins,
    totalLearners,
    activeLearners,
    pendingVerification,
    totalCourses,
    publishedCourses,
    totalSessions,
    sessionsNext7d,
    sessionsWithoutTrainer,
    pendingReservations,
    approvedReservationsMonth,
    totalEnrollments,
    completionRate:
      totalEnrollments === 0 ? 0 : Math.round((completedEnrollments / totalEnrollments) * 100),
    certificatesMonth,
    paymentsMonth,
    revenueMonthTnd: revenueAgg[0]?.total ?? 0,
    failedPayments24h,
    totalCoinsInCirculation: coinSumAgg[0]?.total ?? 0,
    totalCoinsEarnedMonth: coinFlowMonthAgg[0]?.earned ?? 0,
    totalCoinsSpentMonth: coinFlowMonthAgg[0]?.spent ?? 0,
    auditEvents24h,
    auditEvents7d,
    newUsersToday,
    trainerCount,
  };
}

/** Last 8 weeks of user sign-ups (any role). */
export async function signupTrend(): Promise<SignupPoint[]> {
  await connectDb();
  const now = new Date();
  const since = new Date(now.getTime() - 8 * WEEK_MS);

  const rows = await User.find({ createdAt: { $gte: since } })
    .select("createdAt")
    .lean<{ createdAt: Date }[]>();

  const buckets = new Map<string, SignupPoint>();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getTime() - i * WEEK_MS);
    const k = weekKey(d);
    if (!buckets.has(k)) buckets.set(k, { week: k, signups: 0 });
  }
  for (const r of rows) {
    const b = buckets.get(weekKey(new Date(r.createdAt)));
    if (b) b.signups += 1;
  }
  return Array.from(buckets.values());
}

/** Headcount split by role — drives the donut. */
export async function usersByRole(): Promise<RoleSlice[]> {
  await connectDb();
  const rows = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
    { $project: { _id: 0, role: "$_id", users: "$count" } },
  ]);
  return rows;
}

/** Last 8 weeks of paid revenue (succeeded payments only). */
export async function revenueTrend(): Promise<RevenuePoint[]> {
  await connectDb();
  const now = new Date();
  const since = new Date(now.getTime() - 8 * WEEK_MS);

  const rows = await Payment.find({ status: "succeeded", createdAt: { $gte: since } })
    .select("amountTnd createdAt")
    .lean<{ amountTnd: number; createdAt: Date }[]>();

  const buckets = new Map<string, RevenuePoint>();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getTime() - i * WEEK_MS);
    const k = weekKey(d);
    if (!buckets.has(k)) buckets.set(k, { week: k, revenueTnd: 0 });
  }
  for (const r of rows) {
    const b = buckets.get(weekKey(new Date(r.createdAt)));
    if (b) b.revenueTnd += r.amountTnd;
  }
  return Array.from(buckets.values());
}

/** Last 8 weeks of coin flow — earned vs spent. */
export async function coinFlowTrend(): Promise<CoinFlowPoint[]> {
  await connectDb();
  const now = new Date();
  const since = new Date(now.getTime() - 8 * WEEK_MS);

  const rows = await CoinTransaction.find({ createdAt: { $gte: since } })
    .select("delta createdAt")
    .lean<{ delta: number; createdAt: Date }[]>();

  const buckets = new Map<string, CoinFlowPoint>();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getTime() - i * WEEK_MS);
    const k = weekKey(d);
    if (!buckets.has(k)) buckets.set(k, { week: k, earned: 0, spent: 0 });
  }
  for (const r of rows) {
    const b = buckets.get(weekKey(new Date(r.createdAt)));
    if (!b) continue;
    if (r.delta >= 0) b.earned += r.delta;
    else b.spent += Math.abs(r.delta);
  }
  return Array.from(buckets.values());
}

/** Most recent audit-log entries with the actor populated. */
export async function recentAudit(limit = 6): Promise<AuditEntry[]> {
  await connectDb();
  const rows = await AuditLog.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({ path: "actor", select: "firstName surname email" })
    .lean<any[]>();
  return rows.map((r) => ({
    _id: String(r._id),
    action: r.action,
    actorRole: r.actorRole,
    targetType: r.targetType,
    at: (r.createdAt as Date).toISOString(),
    actor: r.actor
      ? { firstName: r.actor.firstName, surname: r.actor.surname, email: r.actor.email }
      : undefined,
  }));
}

/** Items the super-admin should look at right now: pending reservations + sessions without a trainer. */
export async function pendingActionQueue(limit = 6): Promise<PendingItem[]> {
  await connectDb();
  const [reservations, sessions] = await Promise.all([
    Reservation.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: "user", select: "firstName surname email" })
      .populate({ path: "session", populate: { path: "course", select: "title code" } })
      .lean<any[]>(),
    Session.find({ trainer: { $exists: false }, startsAt: { $gte: new Date() } })
      .sort({ startsAt: 1 })
      .limit(limit)
      .populate({ path: "course", select: "title code" })
      .lean<any[]>(),
  ]);

  const out: PendingItem[] = [];
  for (const r of reservations) {
    out.push({
      kind: "reservation",
      id: String(r._id),
      user:
        r.user?.firstName || r.user?.email
          ? `${r.user?.firstName ?? ""} ${r.user?.surname ?? ""}`.trim() || r.user?.email
          : "Unknown",
      course: r.session?.course?.title ?? r.session?.course?.code ?? "—",
      at: (r.createdAt as Date).toISOString(),
    });
  }
  for (const s of sessions) {
    out.push({
      kind: "session",
      id: String(s._id),
      course: s.course?.title ?? s.course?.code ?? "—",
      startsAt: (s.startsAt as Date).toISOString(),
    });
  }
  return out.slice(0, limit);
}
