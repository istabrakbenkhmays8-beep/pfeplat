import { Container } from "@/components/layout/Container";
import { connectDb } from "@/lib/db";
import { User } from "@/src/models";
import { Trophy, Medal, Award } from "lucide-react";

export const metadata = { title: "Leaderboard" };
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  await connectDb();
  const top = await User.find({ role: "user", status: "active" })
    .sort({ walletCoins: -1, lastLoginAt: -1 })
    .limit(20)
    .select("firstName surname country walletCoins level")
    .lean<any[]>();

  return (
    <Container size="default" className="py-12">
      <header className="text-center">
        <div className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-brand" />
          Top learners this season
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Leaderboard</h1>
        <p className="mt-2 text-muted-foreground">
          The 20 learners with the most coins earned. Pass courses, ace assessments, climb the ladder.
        </p>
      </header>

      {top.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-lg font-semibold">No coins earned yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to make the leaderboard.
          </p>
        </div>
      ) : (
        <ol className="mt-10 space-y-2">
          {top.map((u, i) => {
            const rank = i + 1;
            const medal =
              rank === 1 ? Trophy : rank === 2 ? Medal : rank === 3 ? Award : null;
            const tone =
              rank === 1
                ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200"
                : rank === 2
                ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-500/20 dark:text-zinc-200"
                : rank === 3
                ? "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
                : "bg-muted text-muted-foreground";
            return (
              <li
                key={String(u._id)}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${tone}`}>
                  {medal ? (
                    (() => {
                      const Icon = medal;
                      return <Icon className="h-5 w-5" />;
                    })()
                  ) : (
                    rank
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold">
                    {u.firstName} {u.surname?.[0] ?? ""}.
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.country || "—"} · {u.level ?? "beginner"}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-lg font-bold text-brand">{u.walletCoins?.toLocaleString("en-GB") ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">coins</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Container>
  );
}
