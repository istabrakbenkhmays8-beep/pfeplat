import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { CoinTransaction, Course, Enrollment, User } from "@/src/models";
import { getGame } from "@/src/data/games";

export type CompleteGameResult =
  | { ok: true; coinsAwarded: number; alreadyCompleted: boolean }
  | { ok: false; error: "GameNotFound" | "CourseNotFound" };

/** Mark a game-course completed for this user and (on first time) award the coin reward. */
export async function completeGame(opts: {
  userId: string;
  code: string;
  score: number;
  total: number;
}): Promise<CompleteGameResult> {
  const game = getGame(opts.code);
  if (!game) return { ok: false, error: "GameNotFound" };

  await connectDb();
  const course = await Course.findOne({ code: game.code }).select("_id coinReward");
  if (!course) return { ok: false, error: "CourseNotFound" };

  const userOid = new Types.ObjectId(opts.userId);
  let enrollment = await Enrollment.findOne({ user: userOid, course: course._id });
  if (!enrollment) {
    enrollment = await Enrollment.create({
      user: userOid,
      course: course._id,
      status: "active",
      progress: 0,
    });
  }

  // Map score → progress %; if perfect, mark as completed.
  const progressPct = opts.total === 0 ? 0 : Math.round((opts.score / opts.total) * 100);
  enrollment.progress = Math.max(enrollment.progress, progressPct);

  const passed = progressPct >= 70;
  const alreadyCompleted = enrollment.status === "completed";

  if (passed && !alreadyCompleted) {
    enrollment.status = "completed";
    enrollment.completedAt = new Date();
  }

  let coinsAwarded = 0;
  if (passed && !enrollment.coinsAwarded) {
    coinsAwarded = course.coinReward ?? 0;
    enrollment.coinsAwarded = true;
    enrollment.coinsAwardedAt = new Date();
    if (coinsAwarded > 0) {
      const u = await User.findById(userOid);
      if (u) {
        u.walletCoins = (u.walletCoins ?? 0) + coinsAwarded;
        await u.save();
        await CoinTransaction.create({
          user: u._id,
          delta: coinsAwarded,
          reason: "game_score",
          balanceAfter: u.walletCoins,
          course: course._id,
          note: `${game.title} — ${opts.score}/${opts.total}`,
        });
      }
    }
  }

  await enrollment.save();

  return { ok: true, coinsAwarded, alreadyCompleted };
}
