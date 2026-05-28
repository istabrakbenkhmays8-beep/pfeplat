import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import {
  Assessment,
  CoinTransaction,
  Course,
  Enrollment,
  Session,
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
    id: string;
    code: string;
    title: string;
    vendor: string;
    group: string;
    durationDays: number;
  };
  /** Next upcoming session for THIS course, if any (so the UI can show "on-site at Tunis" or "online - link by email"). */
  nextSession: {
    mode: "live_online" | "on_site";
    status: string;
    startsAt: string;
    endsAt: string;
    location: string | null;
    meetingLink: string | null;
  } | null;
};

export async function listUserEnrollments(userId: string): Promise<UserEnrollmentRow[]> {
  await connectDb();
  const rows = await Enrollment.find({ user: new Types.ObjectId(userId) })
    .populate({ path: "course", populate: { path: "category" } })
    .sort({ updatedAt: -1 })
    .lean();

  if (rows.length === 0) return [];

  const courseIds = rows
    .map((r: any) => r.course?._id)
    .filter(Boolean)
    .map((id: any) => new Types.ObjectId(id));
  const now = new Date();
  const sessions = await Session.find({ course: { $in: courseIds }, endsAt: { $gte: now } })
    .sort({ startsAt: 1 })
    .select("course mode status startsAt endsAt location meetingLink")
    .lean();

  const nextByCourse = new Map<string, any>();
  for (const s of sessions) {
    const k = String((s as any).course);
    if (!nextByCourse.has(k)) nextByCourse.set(k, s);
  }

  return rows.map((r: any) => {
    const courseId = String(r.course?._id ?? "");
    const ns = nextByCourse.get(courseId);
    return {
      enrollmentId: String(r._id),
      status: r.status,
      progress: r.progress,
      completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : undefined,
      course: {
        id: courseId,
        code: r.course?.code ?? "-",
        title: r.course?.title ?? "-",
        vendor: r.course?.category?.vendor ?? "",
        group: r.course?.category?.group ?? "",
        durationDays: r.course?.durationDays ?? 0,
      },
      nextSession: ns
        ? {
            mode: ns.mode,
            status: ns.status,
            startsAt: new Date(ns.startsAt).toISOString(),
            endsAt: new Date(ns.endsAt).toISOString(),
            location: ns.location ?? null,
            meetingLink: ns.meetingLink ?? null,
          }
        : null,
    };
  });
}

export async function listUserCoinTransactions(userId: string) {
  await connectDb();
  return CoinTransaction.find({ user: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
}

export type UserCourseWorkspace = {
  enrollmentId: string;
  status: EnrollmentDoc["status"];
  progress: number;
  completedAt?: string;
  course: {
    code: string;
    title: string;
    summary: string;
    description: string;
    categoryName: string;
    vendor: string;
    group: string;
    durationDays: number;
    priceTnd: number;
    coinReward: number;
    modes: string[];
    learningOutcomes: string[];
    prerequisites: string[];
  };
  nextSession: {
    mode: "live_online" | "on_site";
    status: string;
    startsAt: string;
    endsAt: string;
    location: string | null;
    meetingLink: string | null;
  } | null;
  assessment: {
    available: boolean;
    title?: string;
    questionCount: number;
    passThreshold?: number;
    timeLimitMinutes?: number;
  };
  lessonPlan: Array<{
    title: string;
    detail: string;
  }>;
};

function buildLessonPlan(opts: {
  title: string;
  categoryName: string;
  group: string;
  summary?: string;
  learningOutcomes?: string[];
  nextSession?: { mode: "live_online" | "on_site"; startsAt: string; location: string | null } | null;
}) {
  const outcomes = (opts.learningOutcomes ?? []).filter(Boolean);
  if (outcomes.length > 0) {
    return outcomes.slice(0, 4).map((item, index) => ({
      title: `Step ${index + 1}`,
      detail: item,
    }));
  }

  const liveStep =
    opts.nextSession?.mode === "live_online"
      ? "Join the live class when your session opens and follow the trainer step by step."
      : opts.nextSession?.mode === "on_site"
      ? `Attend the on-site class${opts.nextSession.location ? ` at ${opts.nextSession.location}` : ""} and work through the exercises in person.`
      : "Read the handbook first, then work through the guided examples at your own pace.";

  return [
    {
      title: "Get ready",
      detail: opts.summary || `Start with the basics of ${opts.title} and see how the course is organized.`,
    },
    {
      title: "Core lesson",
      detail: `Learn the key ideas behind ${opts.categoryName} and focus on the parts learners use most in ${opts.group.toLowerCase()}.`,
    },
    {
      title: "Practice time",
      detail: liveStep,
    },
    {
      title: "Final check",
      detail: "Review the handbook, take the assessment, and lock in your progress.",
    },
  ];
}

export async function getUserCourseWorkspace(userId: string, courseCode: string): Promise<UserCourseWorkspace | null> {
  await connectDb();

  const course = await Course.findOne({ code: courseCode.toUpperCase(), isPublished: true })
    .populate("category")
    .lean<any>();
  if (!course?._id) return null;

  const enrollment = await Enrollment.findOne({
    user: new Types.ObjectId(userId),
    course: course._id,
  }).lean<any>();
  if (!enrollment?._id) return null;

  const courseId = course._id;
  const [nextSession, assessment] = await Promise.all([
    Session.findOne({ course: courseId, endsAt: { $gte: new Date() } })
      .sort({ startsAt: 1 })
      .select("mode status startsAt endsAt location meetingLink")
      .lean<any>(),
    Assessment.findOne({ course: courseId, isPublished: true })
      .select("title passThreshold timeLimitMinutes questions")
      .lean<any>(),
  ]);

  return {
    enrollmentId: String(enrollment._id),
    status: enrollment.status,
    progress: enrollment.progress ?? 0,
    completedAt: enrollment.completedAt ? new Date(enrollment.completedAt).toISOString() : undefined,
    course: {
      code: course.code,
      title: course.title,
      summary: course.summary ?? "",
      description: course.description ?? "",
      categoryName: course.category?.name ?? "",
      vendor: course.category?.vendor ?? "",
      group: course.category?.group ?? "",
      durationDays: course.durationDays ?? 0,
      priceTnd: course.priceTnd ?? 0,
      coinReward: course.coinReward ?? 0,
      modes: course.modes ?? [],
      learningOutcomes: course.learningOutcomes ?? [],
      prerequisites: course.prerequisites ?? [],
    },
    nextSession: nextSession
      ? {
          mode: nextSession.mode,
          status: nextSession.status,
          startsAt: new Date(nextSession.startsAt).toISOString(),
          endsAt: new Date(nextSession.endsAt).toISOString(),
          location: nextSession.location ?? null,
          meetingLink: nextSession.meetingLink ?? null,
        }
      : null,
    assessment: assessment
      ? {
          available: true,
          title: assessment.title,
          questionCount: Array.isArray(assessment.questions) ? assessment.questions.length : 0,
          passThreshold: assessment.passThreshold,
          timeLimitMinutes: assessment.timeLimitMinutes,
        }
      : {
          available: false,
          questionCount: 0,
        },
    lessonPlan: buildLessonPlan({
      title: course.title,
      categoryName: course.category?.name ?? course.title,
      group: course.category?.group ?? "training",
      summary: course.summary,
      learningOutcomes: course.learningOutcomes,
      nextSession: nextSession
        ? {
            mode: nextSession.mode,
            startsAt: new Date(nextSession.startsAt).toISOString(),
            location: nextSession.location ?? null,
          }
        : null,
    }),
  };
}
