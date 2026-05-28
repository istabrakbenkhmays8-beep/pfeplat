import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import {
  Assessment,
  AssessmentResult,
  CoinTransaction,
  Course,
  Enrollment,
  User,
} from "@/src/models";

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: Array<{ id: string; text: string }>;
};

export type QuizPayload = {
  assessmentId: string;
  course: { code: string; title: string };
  passThreshold: number;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
};

/** Build the public-safe quiz payload (no correctness data). */
export async function loadQuizForCourse(courseCode: string): Promise<QuizPayload | null> {
  await connectDb();
  const course = await Course.findOne({ code: courseCode.toUpperCase() }).select("_id code title");
  if (!course) return null;
  const a = await Assessment.findOne({ course: course._id, isPublished: true });
  if (!a) return null;
  return {
    assessmentId: String(a._id),
    course: { code: course.code, title: course.title },
    passThreshold: a.passThreshold,
    timeLimitMinutes: a.timeLimitMinutes,
    questions: a.questions.map((q: any) => ({
      id: String(q._id),
      prompt: q.prompt,
      options: (q.options ?? []).map((o: any) => ({ id: String(o._id), text: o.text })),
    })),
  };
}

export type SubmitAnswer = { questionId: string; selectedOptionIds: string[] };

export type SubmitResult =
  | {
      ok: true;
      score: number;
      passed: boolean;
      coinsAwarded: number;
      enrollmentId?: string;
    }
  | { ok: false; error: "AssessmentNotFound" | "MaxAttemptsReached" };

export async function submitQuiz(opts: {
  userId: string;
  assessmentId: string;
  answers: SubmitAnswer[];
  startedAt?: Date;
}): Promise<SubmitResult> {
  await connectDb();
  const a = await Assessment.findById(opts.assessmentId);
  if (!a) return { ok: false, error: "AssessmentNotFound" };

  // Count previous attempts
  const previousAttempts = await AssessmentResult.countDocuments({
    assessment: a._id,
    user: new Types.ObjectId(opts.userId),
  });
  if (previousAttempts >= a.maxAttempts) {
    return { ok: false, error: "MaxAttemptsReached" };
  }

  // Build answer map for fast lookup
  const answerMap = new Map(opts.answers.map((x) => [x.questionId, new Set(x.selectedOptionIds)]));

  let earned = 0;
  let total = 0;
  const scoredAnswers = a.questions.map((q: any) => {
    const points = q.points ?? 1;
    total += points;
    const submitted = answerMap.get(String(q._id)) ?? new Set<string>();
    const correctIds = new Set(
      (q.options ?? [])
        .filter((o: any) => o.isCorrect)
        .map((o: any) => String(o._id)),
    );
    const equal =
      submitted.size === correctIds.size &&
      Array.from(submitted).every((id) => correctIds.has(id));
    const pointsAwarded = equal ? points : 0;
    if (equal) earned += points;
    return {
      questionId: q._id,
      selectedOptionIds: Array.from(submitted),
      isCorrect: equal,
      pointsAwarded,
    };
  });

  const score = total === 0 ? 0 : Math.round((earned / total) * 100);
  const passed = score >= a.passThreshold;

  await AssessmentResult.create({
    assessment: a._id,
    user: new Types.ObjectId(opts.userId),
    attempt: previousAttempts + 1,
    score,
    passed,
    answers: scoredAnswers,
    startedAt: opts.startedAt ?? new Date(),
    submittedAt: new Date(),
    timeTakenSeconds: opts.startedAt ? Math.round((Date.now() - opts.startedAt.getTime()) / 1000) : 0,
  });

  let coinsAwarded = 0;
  let enrollmentId: string | undefined;

  if (passed) {
    // Mark the user's enrollment for this course as complete (and award coins if not already).
    const enr = await Enrollment.findOne({
      user: new Types.ObjectId(opts.userId),
      course: a.course,
    });
    if (enr) {
      enrollmentId = String(enr._id);
      if (enr.status !== "completed") {
        enr.status = "completed";
        enr.progress = 100;
        enr.completedAt = new Date();
      }
      if (!enr.coinsAwarded) {
        const course = await Course.findById(a.course).select("coinReward");
        coinsAwarded = course?.coinReward ?? 0;
        enr.coinsAwarded = true;
        enr.coinsAwardedAt = new Date();
        if (coinsAwarded > 0) {
          const u = await User.findById(opts.userId);
          if (u) {
            u.walletCoins = (u.walletCoins ?? 0) + coinsAwarded;
            await u.save();
            await CoinTransaction.create({
              user: u._id,
              delta: coinsAwarded,
              reason: "assessment_pass",
              balanceAfter: u.walletCoins,
              course: a.course,
              note: `Passed assessment for ${a.title}`,
            });
          }
        }
      }
      await enr.save();
    }
  }

  return { ok: true, score, passed, coinsAwarded, enrollmentId };
}
