/** Metadata for every badge the platform can award. The code is stored on the user. */

export type BadgeCode =
  | "first_course"
  | "five_courses"
  | "ten_courses"
  | "first_certificate"
  | "perfect_score"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "first_coin"
  | "hundred_coins"
  | "thousand_coins";

export type BadgeMeta = {
  code: BadgeCode;
  label: string;
  description: string;
  /** Tailwind utility for the chip background tint. */
  tone: string;
  emoji: string;
};

export const BADGES: Record<BadgeCode, BadgeMeta> = {
  first_course: {
    code: "first_course",
    label: "First course",
    description: "Enrolled in your first course.",
    tone: "bg-brand/10 text-brand",
    emoji: "🎓",
  },
  five_courses: {
    code: "five_courses",
    label: "5 courses",
    description: "Enrolled in five courses.",
    tone: "bg-brand/15 text-brand",
    emoji: "📚",
  },
  ten_courses: {
    code: "ten_courses",
    label: "10 courses",
    description: "Ten courses under your belt.",
    tone: "bg-brand/20 text-brand",
    emoji: "🏆",
  },
  first_certificate: {
    code: "first_certificate",
    label: "First certificate",
    description: "Earned your first certificate.",
    tone: "bg-success/10 text-success",
    emoji: "📜",
  },
  perfect_score: {
    code: "perfect_score",
    label: "Perfect score",
    description: "Aced an assessment with 100%.",
    tone: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
    emoji: "💯",
  },
  streak_3: {
    code: "streak_3",
    label: "Hot streak (3d)",
    description: "Active 3 days in a row.",
    tone: "bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200",
    emoji: "🔥",
  },
  streak_7: {
    code: "streak_7",
    label: "Hot streak (7d)",
    description: "Active 7 days in a row.",
    tone: "bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200",
    emoji: "🔥",
  },
  streak_30: {
    code: "streak_30",
    label: "Unstoppable (30d)",
    description: "Active 30 days in a row.",
    tone: "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200",
    emoji: "⚡",
  },
  first_coin: {
    code: "first_coin",
    label: "First coin",
    description: "Earned your first coin.",
    tone: "bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200",
    emoji: "🪙",
  },
  hundred_coins: {
    code: "hundred_coins",
    label: "100 coins",
    description: "Earned 100 coins.",
    tone: "bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200",
    emoji: "💰",
  },
  thousand_coins: {
    code: "thousand_coins",
    label: "1 000 coins",
    description: "Earned 1 000 coins.",
    tone: "bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200",
    emoji: "👑",
  },
};

export function getBadgeMeta(code: string): BadgeMeta | undefined {
  return (BADGES as Record<string, BadgeMeta>)[code];
}
