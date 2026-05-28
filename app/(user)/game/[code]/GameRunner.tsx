"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Check, Loader2, Sparkles, X } from "lucide-react";

type Game = {
  code: string;
  title: string;
  intro: string;
  challenges: Array<{
    idx: number;
    prompt: string;
    options: Array<{ idx: number; text: string }>;
    correctIdx: number;
    reveal: string;
  }>;
};

type Phase = "intro" | "answering" | "feedback" | "done";

export function GameRunner({ game }: { game: Game }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);

  const total = game.challenges.length;
  const current = game.challenges[step];

  function answer(optionIdx: number) {
    if (phase !== "answering") return;
    setPick(optionIdx);
    if (optionIdx === current.correctIdx) {
      setScore((s) => s + 1);
    }
    setPhase("feedback");
  }

  async function next() {
    if (step + 1 < total) {
      setStep((s) => s + 1);
      setPick(null);
      setPhase("answering");
      return;
    }
    // Last step → submit completion.
    setBusy(true);
    try {
      const res = await fetch(`/api/game/${encodeURIComponent(game.code)}/complete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ score, total }),
      });
      const body = await res.json();
      if (res.ok && body.coinsAwarded > 0) {
        toast.success(`+${body.coinsAwarded} coins!`);
      }
      setPhase("done");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (phase === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -15, 15, 0] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-brand-foreground"
        >
          <Sparkles className="h-8 w-8" />
        </motion.div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-brand">
          Game challenge · {game.code}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{game.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{game.intro}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          {total} challenges · pass at 70% to earn coins
        </p>
        <button
          type="button"
          onClick={() => setPhase("answering")}
          className="mt-6 inline-flex h-12 items-center rounded-md bg-brand px-8 text-sm font-semibold text-brand-foreground transition hover:bg-brand-600"
        >
          Start the game →
        </button>
      </motion.div>
    );
  }

  if (phase === "done") {
    const pct = total === 0 ? 0 : Math.round((score / total) * 100);
    const passed = pct >= 70;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={
          passed
            ? "rounded-2xl border border-success/40 bg-success/10 p-10 text-center"
            : "rounded-2xl border border-warning/40 bg-warning/10 p-10 text-center"
        }
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className={
            passed
              ? "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-white"
              : "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-warning text-white"
          }
        >
          {passed ? <Check className="h-10 w-10" /> : <X className="h-10 w-10" />}
        </motion.div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest">{passed ? "Crushed it" : "Almost there"}</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-1 text-6xl font-bold"
        >
          {pct}%
        </motion.p>
        <p className="mt-2 text-sm text-muted-foreground">
          You answered {score} of {total} correctly.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setPick(null);
              setScore(0);
              setPhase("answering");
            }}
            className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
          >
            Play again
          </button>
          <a
            href="/my-courses"
            className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
          >
            My courses
          </a>
        </div>
      </motion.div>
    );
  }

  // Answering / feedback
  const pct = ((step + (phase === "feedback" ? 1 : 0)) / total) * 100;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-brand"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs font-mono font-semibold text-muted-foreground">
          {step + 1} / {total}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step + (phase === "feedback" ? "-fb" : "-q")}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Challenge {step + 1}
          </p>
          <h2 className="mt-2 text-xl font-bold">{current.prompt}</h2>

          <ul className="mt-5 space-y-2">
            {current.options.map((o) => {
              const isPick = pick === o.idx;
              const isCorrect = o.idx === current.correctIdx;
              const reveal = phase === "feedback";
              const tone = reveal
                ? isCorrect
                  ? "border-success bg-success/10 text-fg"
                  : isPick
                  ? "border-danger bg-danger/10 text-fg"
                  : "border-border bg-card text-muted-foreground"
                : isPick
                ? "border-brand bg-brand/5 text-fg"
                : "border-border bg-surface text-fg hover:bg-muted";
              return (
                <motion.li key={o.idx} whileTap={{ scale: 0.98 }}>
                  <button
                    type="button"
                    disabled={phase === "feedback"}
                    onClick={() => answer(o.idx)}
                    className={`flex w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm transition ${tone}`}
                  >
                    <span>{o.text}</span>
                    {reveal && isCorrect && <Check className="h-4 w-4 text-success" />}
                    {reveal && !isCorrect && isPick && <X className="h-4 w-4 text-danger" />}
                  </button>
                </motion.li>
              );
            })}
          </ul>

          <AnimatePresence>
            {phase === "feedback" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-5 rounded-lg border border-border bg-muted/40 p-4 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                    {pick === current.correctIdx ? "Correct" : "Heads up"}
                  </p>
                  <p className="mt-1 leading-relaxed">{current.reveal}</p>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={next}
                    disabled={busy}
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-6 text-sm font-semibold text-brand-foreground transition hover:bg-brand-600 disabled:opacity-60"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    {step + 1 < total ? "Next challenge →" : "See your score"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-xs text-muted-foreground">
        Score so far: {score} / {step + (phase === "feedback" ? 1 : 0)}
      </p>
    </div>
  );
}
