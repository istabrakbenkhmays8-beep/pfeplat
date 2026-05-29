import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { Enrollment, User } from "@/src/models";
import type { BadgeCode } from "@/lib/badges";

function sameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function dayDiff(a: Date, b: Date): number {
  const ms =
    Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()) -
    Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round(ms / 86_400_000);
}

/**
 * Mark the user as active "today" and update their streak counters.
 * Idempotent within the same UTC day.
 */
export async function recordActivity(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  badgesAwarded: BadgeCode[];
}> {
  await connectDb();
  const u = await User.findById(new Types.ObjectId(userId));
  if (!u) return { currentStreak: 0, longestStreak: 0, badgesAwarded: [] };

  const now = new Date();
  const last = u.lastActiveOn ? new Date(u.lastActiveOn) : null;

  let current = u.currentStreak ?? 0;
  if (!last) {
    current = 1;
  } else if (sameUtcDay(last, now)) {
    // Already counted today.
  } else {
    const diff = dayDiff(now, last);
    current = diff === 1 ? current + 1 : 1;
  }
  const longest = Math.max(u.longestStreak ?? 0, current);

  u.lastActiveOn = now;
  u.currentStreak = current;
  u.longestStreak = longest;

  const newlyAwarded = await awardBadgesIfDue(u, { currentStreak: current });
  await u.save();

  return { currentStreak: current, longestStreak: longest, badgesAwarded: newlyAwarded };
}

/**
 * Re-evaluate all badge eligibility for the given user. Pass extra signals (currentStreak,
 * coinDelta) when known; otherwise we look them up from the doc.
 */
export async function awardBadgesIfDue(
  user: any, // a Mongoose User doc (mutable)
  signals: { currentStreak?: number } = {},
): Promise<BadgeCode[]> {
  const have = new Set<string>((user.badges ?? []).map((b: any) => b.code));
  const award = (code: BadgeCode) => {
    if (have.has(code)) return false;
    user.badges = [...(user.badges ?? []), { code, awardedAt: new Date() }];
    have.add(code);
    return true;
  };
  const awarded: BadgeCode[] = [];

  // Streak-based
  const cs = signals.currentStreak ?? user.currentStreak ?? 0;
  if (cs >= 3 && award("streak_3")) awarded.push("streak_3");
  if (cs >= 7 && award("streak_7")) awarded.push("streak_7");
  if (cs >= 30 && award("streak_30")) awarded.push("streak_30");

  // Enrollment-count based
  const enrollmentCount = await Enrollment.countDocuments({ user: user._id });
  if (enrollmentCount >= 1 && award("first_course")) awarded.push("first_course");
  if (enrollmentCount >= 5 && award("five_courses")) awarded.push("five_courses");
  if (enrollmentCount >= 10 && award("ten_courses")) awarded.push("ten_courses");

  // Completion-based
  const completedCount = await Enrollment.countDocuments({ user: user._id, status: "completed" });
  if (completedCount >= 1 && award("first_certificate")) awarded.push("first_certificate");

  // Coin-based
  const coins = user.walletCoins ?? 0;
  if (coins >= 1 && award("first_coin")) awarded.push("first_coin");
  if (coins >= 100 && award("hundred_coins")) awarded.push("hundred_coins");
  if (coins >= 1000 && award("thousand_coins")) awarded.push("thousand_coins");

  return awarded;
}
