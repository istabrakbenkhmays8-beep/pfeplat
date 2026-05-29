import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getGame } from "@/src/data/games";
import { GameRunner } from "./GameRunner";

export const metadata = { title: "Game challenge" };

type RouteParams = Promise<{ code: string }>;

export default async function GamePage({ params }: { params: RouteParams }) {
  await requireRole("user");
  const { code } = await params;
  const game = getGame(decodeURIComponent(code));
  if (!game) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">{game.code}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{game.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Take a quick break and help the hero dodge real-world problems. Jump over obstacles, pause anytime, and try to
            beat your best score.
          </p>
        </div>
        <Link
          href="/games"
          className="inline-flex h-10 items-center rounded-md border border-border bg-card px-4 text-sm font-medium text-fg hover:border-brand/40 hover:text-brand"
        >
          Back to games
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">How to play</p>
          <p className="mt-2 text-sm text-muted-foreground">Press Space, Arrow Up, or tap Jump to clear each problem.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Pause</p>
          <p className="mt-2 text-sm text-muted-foreground">Use the Pause button or press P whenever you want a short break.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Goal</p>
          <p className="mt-2 text-sm text-muted-foreground">Stay calm, dodge more problems, and keep your score climbing.</p>
        </div>
      </div>

      <GameRunner game={game} />
    </div>
  );
}
