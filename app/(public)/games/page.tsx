import Link from "next/link";
import { Sparkles, Trophy } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { GAMES } from "@/src/data/games";

export const metadata = { title: "Game challenges" };

export default function GamesIndexPage() {
  return (
    <Container size="default" className="py-12">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          Practice + earn coins
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Game challenges</h1>
        <p className="mt-2 text-muted-foreground">
          Short, replayable scenarios. Five rapid-fire questions per game — pick fast, learn from every answer, earn coins on first pass.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {GAMES.map((g) => (
          <Link
            key={g.code}
            href={`/game/${encodeURIComponent(g.code)}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-brand/50 hover:shadow-md"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-brand/10 transition group-hover:scale-150"
            />
            <div className="relative">
              <Trophy className="h-7 w-7 text-brand" />
              <p className="mt-3 font-mono text-xs font-semibold text-muted-foreground">{g.code}</p>
              <h2 className="mt-1 text-lg font-bold">{g.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{g.intro}</p>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-brand/10 px-2 py-1 font-medium text-brand">
                  {g.challenges.length} challenges
                </span>
                <span className="rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground">
                  ~2 min
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
