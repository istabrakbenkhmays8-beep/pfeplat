import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import {
  CoinTransaction,
  Course,
  Enrollment,
  User,
  type EnrollmentDoc,
} from "@/src/models";

export type EnrollResult =
  | { ok: true; enrollmentId: string; alreadyEnrolled: boolean }
  | { ok: false; error: "CourseNotFound" | "UserNotFound" };

export async function enroll(userId: string, courseCode: string): Promise<EnrollResult> {
  await connectDb();
  const course = await Course.findOne({ code: courseCode.toUpperCase(), isPublished: true }).select("_id");
  if (!course) return { ok: false, error: "CourseNotFound" };

  const userOid = new Types.ObjectId(userId);
  const existing = await Enrollment.findOne({ user: userOid, course: course._id }).select("_id");
  if (existing) {
    return { ok: true, enrollmentId: String(existing._id), alreadyEnrolled: true };
  }

  const e = await Enrollment.create({
    user: userOid,
    course: course._id,
    status: "active",
    progress: 0,
  });
  return { ok: true, enrollmentId: String(e._id), alreadyEnrolled: false };
}

/**
 * Mark an enrollment as completed and award coins on first completion only.
 * Re-running this is a no-op for coin awards (anti-farming).
 */
export async function completeEnrollment(userId: string, enrollmentId: string) {
  await connectDb();
  const e = await Enrollment.findOne({
    _id: new Types.ObjectId(enrollmentId),
    user: new Types.ObjectId(userId),
  });
  if (!e) return { ok: false as const, error: "EnrollmentNotFound" as const };

  const wasAlreadyCompleted = e.status === "completed";
  e.status = "completed";
  e.progress = 100;
  if (!e.completedAt) e.completedAt = new Date();

  let coinsAwarded = 0;
  if (!e.coinsAwarded) {
    const course = await Course.findById(e.course).select("coinReward");
    coinsAwarded = course?.coinReward ?? 0;
    e.coinsAwarded = true;
    e.coinsAwardedAt = new Date();

    if (coinsAwarded > 0) {
      const user = await User.findById(e.user);
      if (user) {
        user.walletCoins = (user.walletCoins ?? 0) + coinsAwarded;
        await user.save();
        await CoinTransaction.create({
          user: user._id,
          delta: coinsAwarded,
          reason: "course_completion",
          balanceAfter: user.walletCoins,
          course: e.course,
          note: "Course completion reward",
        });
      }
    }
  }

  await e.save();
  return {
    ok: true as const,
    coinsAwarded,
    alreadyCompleted: wasAlreadyCompleted,
  };
}

export type UserEnrollmentRow = {
  enrollmentId: string;
  status: EnrollmentDoc["status"];
  progress: number;
  completedAt?: string;
  course: {
    code: string;
    title: string;
    vendor: string;
    group: string;
    durationDays: number;
  };
};

export async function listUserEnrollments(userId: string): Promise<UserEnrollmentRow[]> {
  await connectDb();
  const rows = await Enrollment.find({ user: new Types.ObjectId(userId) })
    .populate({ path: "course", populate: { path: "category" } })
    .sort({ updatedAt: -1 })
    .lean();

  return rows.map((r: any) => ({
    enrollmentId: String(r._id),
    status: r.status,
    progress: r.progress,
    completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : undefined,
    course: {
      code: r.course?.code ?? "—",
      title: r.course?.title ?? "—",
      vendor: r.course?.category?.vendor ?? "",
      group: r.course?.category?.group ?? "",
      durationDays: r.course?.durationDays ?? 0,
    },
  }));
}

export async function listUserCoinTransactions(userId: string) {
  await connectDb();
  return CoinTransaction.find({ user: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
}
