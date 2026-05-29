import Link from "next/link";
import { Sparkles, Trophy, Network, Cloud, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { GAMES } from "@/src/data/games";

export const metadata = { title: "Game challenges" };

const FLAVOR: Record<
  string,
  { icon: typeof Trophy; accent: string; chip: string; tagline: string; difficulty: "Beginner" | "Intermediate" | "Advanced" }
> = {
  CCNA: {
    icon: Network,
    accent: "from-sky-500/20 via-sky-500/0 to-transparent",
    chip: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200",
    tagline: "Routing, switching, DNS, and subnet roadblocks.",
    difficulty: "Beginner",
  },
  "AZ-104": {
    icon: Cloud,
    accent: "from-blue-500/20 via-blue-500/0 to-transparent",
    chip: "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200",
    tagline: "Cloud quotas, access blocks, and latency spikes.",
    difficulty: "Intermediate",
  },
  ISO27001LI: {
    icon: ShieldCheck,
    accent: "from-rose-500/20 via-rose-500/0 to-transparent",
    chip: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200",
    tagline: "Phishing, leaks, and security slip-ups.",
    difficulty: "Intermediate",
  },
};

const DEFAULT_FLAVOR = {
  icon: Trophy,
  accent: "from-brand/20 via-brand/0 to-transparent",
  chip: "bg-brand/10 text-brand",
  tagline: "A playful run full of quick surprises.",
  difficulty: "Beginner" as const,
};

export default function GamesIndexPage() {
  return (
    <Container size="default" className="py-12">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          Quick break + playful practice
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Pick a fun run</h1>
        <p className="mt-2 text-muted-foreground">
          Three short runner games. Help the hero jump over problems, pause anytime, and chase a better score whenever you
          want a quick break.
        </p>
      </header>

      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, idx) => {
          const f = FLAVOR[g.code] ?? DEFAULT_FLAVOR;
          const Icon = f.icon;
          return (
            <li key={g.code}>
              <Link
                href={`/game/${encodeURIComponent(g.code)}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg"
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br ${f.accent} opacity-70 transition group-hover:opacity-100`}
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.chip}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Game {idx + 1} / {GAMES.length}
                  </span>
                </div>

                <div className="relative mt-5">
                  <p className="font-mono text-xs font-semibold text-muted-foreground">{g.code}</p>
                  <h2 className="mt-1 text-lg font-bold leading-tight">{g.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{f.tagline}</p>
                  <p className="mt-3 line-clamp-3 text-xs text-muted-foreground/90">{g.intro}</p>
                </div>

                <div className="relative mt-5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 font-semibold text-brand">
                    {g.challenges.length} problem types
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">jump + dodge</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${f.chip}`}>{f.difficulty}</span>
                </div>

                <div className="relative mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">Play, pause, and beat your best score</span>
                  <span className="inline-flex h-9 items-center gap-1 rounded-md bg-brand px-3 text-xs font-semibold text-brand-foreground transition group-hover:bg-brand-600">
                    Play
                    <span aria-hidden className="transition group-hover:translate-x-0.5">-&gt;</span>
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        New to the platform?{" "}
        <Link href="/auth/register" className="font-medium text-brand hover:underline">
          Create a free account
        </Link>{" "}
        to save your scores and collect coins.
      </p>
    </Container>
  );
}
