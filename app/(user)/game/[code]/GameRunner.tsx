"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Pause, Play, RotateCcw } from "lucide-react";
import type { Game } from "@/src/data/games";

type RunnerStatus = "idle" | "playing" | "paused" | "gameover";

type Obstacle = {
  id: number;
  x: number;
  width: number;
  height: number;
  label: string;
  passed: boolean;
};

type RunnerState = {
  status: RunnerStatus;
  heroLift: number;
  heroVelocity: number;
  obstacles: Obstacle[];
  score: number;
  bestScore: number;
  lives: number;
  dodged: number;
  speed: number;
};

type TrackTheme = {
  heroName: string;
  coachLine: string;
  sky: string;
  skyline: string;
  chip: string;
  heroSuit: string;
  heroCape: string;
  floorGlow: string;
  problemLabels: string[];
};

const TRACKS: Record<string, TrackTheme> = {
  CCNA: {
    heroName: "Lina",
    coachLine: "Network day is busy. Help Lina jump over packet loss, loops, and broken DNS.",
    sky: "from-sky-200 via-cyan-100 to-white dark:from-sky-950 dark:via-slate-950 dark:to-slate-900",
    skyline: "bg-sky-500/15 dark:bg-sky-400/10",
    chip: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200",
    heroSuit: "from-sky-500 to-cyan-400",
    heroCape: "bg-brand",
    floorGlow: "from-sky-500/35 via-sky-500/5 to-transparent",
    problemLabels: ["Packet loss", "DNS", "Loop", "Timeout", "Wrong subnet", "Slow link"],
  },
  "AZ-104": {
    heroName: "Yassine",
    coachLine: "Cloud tasks keep coming. Help Yassine leap over drift, latency, and quota limits.",
    sky: "from-blue-200 via-indigo-100 to-white dark:from-blue-950 dark:via-slate-950 dark:to-slate-900",
    skyline: "bg-blue-500/15 dark:bg-blue-400/10",
    chip: "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200",
    heroSuit: "from-blue-500 to-indigo-400",
    heroCape: "bg-brand",
    floorGlow: "from-blue-500/35 via-blue-500/5 to-transparent",
    problemLabels: ["Quota limit", "Latency", "Drift", "Outage", "Access block", "Retry storm"],
  },
  ISO27001LI: {
    heroName: "Sami",
    coachLine: "Security alerts never sleep. Help Sami dodge phishing, leaks, and risky shortcuts.",
    sky: "from-rose-200 via-orange-100 to-white dark:from-rose-950 dark:via-slate-950 dark:to-slate-900",
    skyline: "bg-rose-500/15 dark:bg-rose-400/10",
    chip: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200",
    heroSuit: "from-rose-500 to-orange-400",
    heroCape: "bg-brand",
    floorGlow: "from-rose-500/35 via-rose-500/5 to-transparent",
    problemLabels: ["Phishing", "Leak", "Weak password", "Malware", "Shadow app", "Missed update"],
  },
};

const DEFAULT_TRACK: TrackTheme = {
  heroName: "Nour",
  coachLine: "A quick learning break. Dodge the problems, stay light on your feet, and beat your best score.",
  sky: "from-zinc-200 via-stone-100 to-white dark:from-zinc-900 dark:via-slate-950 dark:to-slate-900",
  skyline: "bg-zinc-500/15 dark:bg-zinc-400/10",
  chip: "bg-brand/10 text-brand",
  heroSuit: "from-zinc-700 to-zinc-500",
  heroCape: "bg-brand",
  floorGlow: "from-brand/35 via-brand/5 to-transparent",
  problemLabels: ["Delay", "Bug", "Noise", "Stress", "Rush job", "Confusion"],
};

const START_LIVES = 3;
const BASE_SPEED = 7.2;
const MAX_SPEED = 14.5;
const JUMP_FORCE = 14.5;
const GRAVITY = 0.88;
const HERO_X = 112;
const HERO_SIZE = 58;

function makeInitialState(bestScore = 0): RunnerState {
  return {
    status: "idle",
    heroLift: 0,
    heroVelocity: 0,
    obstacles: [],
    score: 0,
    bestScore,
    lives: START_LIVES,
    dodged: 0,
    speed: BASE_SPEED,
  };
}

function clampDelta(deltaMs: number) {
  return Math.min(34, Math.max(10, deltaMs));
}

export function GameRunner({ game }: { game: Game }) {
  const track = TRACKS[game.code] ?? DEFAULT_TRACK;
  const bestKey = `advancia-runner-best:${game.code}`;

  const [runner, setRunner] = useState<RunnerState>(() => makeInitialState());

  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const spawnInRef = useRef(900);
  const obstacleIdRef = useRef(1);
  const damageUntilRef = useRef(0);
  const bestScoreRef = useRef(0);
  const runnerRef = useRef(runner);

  useEffect(() => {
    runnerRef.current = runner;
  }, [runner]);

  useEffect(() => {
    const stored = window.localStorage.getItem(bestKey);
    const best = stored ? Number(stored) : 0;
    if (Number.isFinite(best) && best > 0) {
      bestScoreRef.current = best;
      setRunner((prev) => ({ ...prev, bestScore: best }));
    }
  }, [bestKey]);

  function saveBest(score: number) {
    if (score <= bestScoreRef.current) return;
    bestScoreRef.current = score;
    window.localStorage.setItem(bestKey, String(score));
  }

  function startGame() {
    lastFrameRef.current = null;
    spawnInRef.current = 850;
    obstacleIdRef.current = 1;
    damageUntilRef.current = 0;
    setRunner({
      ...makeInitialState(bestScoreRef.current),
      status: "playing",
    });
  }

  function togglePause() {
    setRunner((prev) => {
      if (prev.status === "playing") return { ...prev, status: "paused" };
      if (prev.status === "paused") return { ...prev, status: "playing" };
      return prev;
    });
  }

  function jump() {
    setRunner((prev) => {
      if (prev.status === "idle") {
        return { ...makeInitialState(bestScoreRef.current), status: "playing", heroVelocity: JUMP_FORCE };
      }
      if (prev.status !== "playing" || prev.heroLift > 0.5) return prev;
      return {
        ...prev,
        heroVelocity: JUMP_FORCE,
      };
    });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        event.preventDefault();
        jump();
      } else if (event.code === "KeyP" || event.code === "Escape") {
        event.preventDefault();
        togglePause();
      } else if (event.code === "Enter" && runnerRef.current.status === "gameover") {
        event.preventDefault();
        startGame();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    if (runner.status !== "playing") {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastFrameRef.current = null;
      return;
    }

    const tick = (time: number) => {
      const previousTime = lastFrameRef.current ?? time;
      lastFrameRef.current = time;
      const deltaMs = clampDelta(time - previousTime);
      const deltaUnit = deltaMs / 16.67;

      setRunner((prev) => {
        if (prev.status !== "playing") return prev;

        let heroVelocity = prev.heroVelocity - GRAVITY * deltaUnit;
        let heroLift = prev.heroLift + heroVelocity * deltaUnit;
        if (heroLift <= 0) {
          heroLift = 0;
          heroVelocity = 0;
        }

        let score = prev.score + deltaMs * 0.03;
        const speed = Math.min(MAX_SPEED, prev.speed + deltaMs * 0.0018);
        let dodged = prev.dodged;
        let lives = prev.lives;
        let status: RunnerStatus = prev.status;

        spawnInRef.current -= deltaMs;
        let nextObstacles = prev.obstacles.map((obstacle) => ({
          ...obstacle,
          x: obstacle.x - speed * deltaUnit,
        }));

        if (spawnInRef.current <= 0) {
          const labels = track.problemLabels;
          const label = labels[Math.floor(Math.random() * labels.length)];
          nextObstacles.push({
            id: obstacleIdRef.current++,
            x: 940,
            width: 72 + Math.random() * 18,
            height: 44 + Math.random() * 54,
            label,
            passed: false,
          });
          spawnInRef.current = Math.max(520, 1150 - Math.min(score * 2.2, 420)) + Math.random() * 450;
        }

        const heroRight = HERO_X + HERO_SIZE;
        const now = time;
        const canTakeDamage = now >= damageUntilRef.current;

        nextObstacles = nextObstacles
          .filter((obstacle) => obstacle.x + obstacle.width > -80)
          .map((obstacle) => {
            if (!obstacle.passed && obstacle.x + obstacle.width < HERO_X) {
              score += 18;
              dodged += 1;
              return { ...obstacle, passed: true };
            }
            return obstacle;
          });

        for (const obstacle of nextObstacles) {
          const overlapX = HERO_X < obstacle.x + obstacle.width - 10 && heroRight > obstacle.x + 10;
          const overlapY = heroLift < obstacle.height - 4;
          if (overlapX && overlapY && canTakeDamage) {
            lives -= 1;
            damageUntilRef.current = now + 850;
            nextObstacles = nextObstacles.filter((item) => item.id !== obstacle.id);
            if (lives <= 0) {
              status = "gameover";
            }
            break;
          }
        }

        const roundedScore = Math.max(0, Math.floor(score));
        const bestScore = Math.max(prev.bestScore, roundedScore);
        if (bestScore > prev.bestScore) {
          saveBest(bestScore);
        }

        return {
          status,
          heroLift,
          heroVelocity,
          obstacles: nextObstacles,
          score: roundedScore,
          bestScore,
          lives,
          dodged,
          speed,
        };
      });

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
    // saveBest only reads/writes refs and is safe to capture; re-adding it as a
    // dep would tear down the requestAnimationFrame loop on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.status, track.problemLabels]);

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
        <div className={`relative overflow-hidden bg-gradient-to-b ${track.sky}`} style={{ minHeight: 420 }}>
          <div className="absolute inset-x-0 top-5 flex justify-between px-6 text-xs font-semibold text-muted-foreground">
            <span className={`rounded-full px-3 py-1 ${track.chip}`}>{game.code} run</span>
            <span className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-slate-700 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200">
              Pause anytime
            </span>
          </div>

          <div aria-hidden className="absolute inset-x-0 bottom-16 flex items-end gap-4 px-6 opacity-80">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={`rounded-t-3xl ${track.skyline}`}
                style={{
                  width: `${48 + (index % 3) * 18}px`,
                  height: `${70 + ((index * 29) % 110)}px`,
                }}
              />
            ))}
          </div>

          <div
            aria-hidden
            className={`absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t ${track.floorGlow}`}
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-[#171717] dark:bg-black" />
          <div aria-hidden className="absolute inset-x-0 bottom-12 h-1 bg-white/60 dark:bg-white/10" />

          <div className="absolute left-6 top-16 max-w-sm rounded-2xl border border-white/40 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Hero mission</p>
            <h2 className="mt-2 text-xl font-bold">{track.heroName}'s quick break run</h2>
            <p className="mt-2 text-sm text-muted-foreground">{track.coachLine}</p>
          </div>

          <div
            className="absolute bottom-16 left-[112px] z-10 transition-transform duration-75"
            style={{ transform: `translateY(${-runner.heroLift}px)` }}
          >
            <div className="relative h-[58px] w-[58px]">
              <div className="absolute left-4 top-0 h-5 w-5 rounded-full bg-amber-200 shadow-sm" />
              <div className={`absolute left-2 top-5 h-8 w-10 rounded-2xl bg-gradient-to-b ${track.heroSuit} shadow-lg`} />
              <div className={`absolute left-0 top-7 h-3 w-4 rounded-full ${track.heroCape} opacity-90`} />
              <div className="absolute left-2 top-[52px] h-2 w-2 rounded-full bg-card" />
              <div className="absolute left-8 top-[52px] h-2 w-2 rounded-full bg-card" />
            </div>
          </div>

          {runner.obstacles.map((obstacle) => (
            <div
              key={obstacle.id}
              className="absolute bottom-16 z-10 flex items-end"
              style={{ transform: `translateX(${obstacle.x}px)` }}
            >
              <div
                className="flex items-end rounded-2xl border border-black/10 bg-slate-900/95 px-3 pb-3 pt-2 text-[11px] font-semibold text-white shadow-xl dark:border-white/10"
                style={{ width: obstacle.width, height: obstacle.height }}
              >
                <span className="leading-tight">{obstacle.label}</span>
              </div>
            </div>
          ))}

          {(runner.status === "idle" || runner.status === "paused" || runner.status === "gameover") && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/35 p-6 backdrop-blur-[2px]">
              <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/92 p-6 text-center shadow-2xl dark:border-white/10 dark:bg-slate-950/92">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  {runner.status === "idle"
                    ? "Ready"
                    : runner.status === "paused"
                    ? "Paused"
                    : "Run complete"}
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  {runner.status === "idle"
                    ? "Start the run"
                    : runner.status === "paused"
                    ? "Take your time"
                    : "Nice work"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {runner.status === "idle"
                    ? "Jump over the problems, keep your lives, and build the highest score you can."
                    : runner.status === "paused"
                    ? "Resume whenever you are ready. Your score and lives will stay exactly where you left them."
                    : `You dodged ${runner.dodged} problems and reached ${runner.score} points.`}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {runner.status !== "paused" ? (
                    <button
                      type="button"
                      onClick={startGame}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
                    >
                      {runner.status === "gameover" ? "Play again" : "Start now"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={togglePause}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
                    >
                      Resume run
                    </button>
                  )}
                  {runner.status === "gameover" ? (
                    <Link
                      href="/games"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-fg hover:border-brand/40 hover:text-brand"
                    >
                      Try another game
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-3 border-t border-border bg-card p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Score" value={String(runner.score)} />
            <StatCard label="Best" value={String(runner.bestScore)} />
            <StatCard label="Lives" value={String(runner.lives)} />
            <StatCard label="Dodged" value={String(runner.dodged)} />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={jump}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
            >
              <ArrowUp className="h-4 w-4" />
              Jump
            </button>
            <button
              type="button"
              onClick={togglePause}
              disabled={runner.status === "idle" || runner.status === "gameover"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-fg hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              {runner.status === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {runner.status === "paused" ? "Resume" : "Pause"}
            </button>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-fg hover:border-brand/40 hover:text-brand"
          >
            <RotateCcw className="h-4 w-4" />
            Restart
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Quick tips</p>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li>Start with one clean jump. The hero can jump again only after landing.</li>
            <li>Each problem you clear boosts your score, so timing matters more than speed.</li>
            <li>Use Pause whenever you want a short break in the middle of the run.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Problem list</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {track.problemLabels.map((label) => (
              <span key={label} className={`rounded-full px-3 py-1 text-xs font-semibold ${track.chip}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Why this helps</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Short games make the platform feel lighter. A quick run gives the user a break, a small challenge, and a reason
            to come back for one more score.
          </p>
        </div>
      </aside>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
