import Link from "next/link";
import { Flame, Gamepad2, Sparkles } from "lucide-react";
import { Types } from "mongoose";
import { getSession } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { Enrollment, User } from "@/src/models";
import { listUserEnrollments } from "@/src/services/enrollmentService";
import { awardBadgesIfDue } from "@/src/services/gamificationService";
import { getBadgeMeta } from "@/lib/badges";
import { getT } from "@/src/i18n/server";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const session = await getSession();
  if (!session) return null;
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const { t } = await getT();
  await connectDb();
  const uid = new Types.ObjectId(session.user.id);
  const userDoc = await User.findById(uid);
  if (!userDoc) return null;

  await awardBadgesIfDue(userDoc);
  await userDoc.save();

  const [inProgress, completedCount, recent] = await Promise.all([
    Enrollment.countDocuments({ user: uid, status: "active" }),
    Enrollment.countDocuments({ user: uid, status: "completed" }),
    listUserEnrollments(session.user.id).then((rows) => rows.slice(0, 3)),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t.userDash.welcome}, {firstName}.
          </h1>
          <p className="text-sm text-muted-foreground">{t.userDash.pickUp}</p>
        </div>
        {(userDoc.currentStreak ?? 0) > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-900 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-200">
            <Flame className="h-4 w-4" />
            {userDoc.currentStreak}-day streak - longest {userDoc.longestStreak ?? userDoc.currentStreak}
          </div>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: t.userDash.inProgress, value: String(inProgress), href: "/my-courses" },
          { label: t.userDash.coinsEarned, value: String(userDoc.walletCoins ?? 0), href: "/wallet" },
          { label: t.userDash.certificates, value: String(completedCount), href: "/certificates" },
        ].map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="mt-2 text-3xl font-bold">{k.value}</p>
          </Link>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand/10 via-card to-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
              <Sparkles className="h-3 w-3" />
              Earn coins
            </div>
            <h2 className="mt-1 text-lg font-bold">Play a quick hero run</h2>
            <p className="text-sm text-muted-foreground">
              Three short runner games. Jump over problems, pause anytime, and enjoy a quick break between lessons.
            </p>
          </div>
          <Link
            href="/games"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
          >
            Open games
            <span aria-hidden>-&gt;</span>
          </Link>
        </div>
      </section>

      {(userDoc.badges ?? []).length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Badges earned</h2>
          <ul className="flex flex-wrap gap-2">
            {(userDoc.badges as any[]).map((b: any) => {
              const meta = getBadgeMeta(b.code);
              if (!meta) return null;
              return (
                <li
                  key={b.code}
                  title={meta.description}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${meta.tone}`}
                >
                  <span aria-hidden className="text-base leading-none">{meta.emoji}</span>
                  {meta.label}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {recent.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">{t.userDash.noEnrollments}</p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
          >
            {t.userDash.browseCourses}
          </Link>
        </div>
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t.userDash.continueLearning}</h2>
            <Link href="/my-courses" className="text-sm font-medium text-brand hover:underline">
              {t.userDash.viewAll}
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((r) => (
              <Link
                key={r.enrollmentId}
                href={`/learn/${encodeURIComponent(r.course.code)}`}
                className="rounded-xl border border-border bg-card p-4 transition hover:border-brand/50 hover:shadow-sm"
              >
                <p className="font-mono text-xs text-muted-foreground">{r.course.code}</p>
                <p className="mt-1 line-clamp-2 font-medium">{r.course.title}</p>
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-brand" style={{ width: `${r.progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.progress}% complete</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
