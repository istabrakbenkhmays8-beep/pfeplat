"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: Array<{ id: string; text: string }>;
};

type Quiz = {
  assessmentId: string;
  course: { code: string; title: string };
  passThreshold: number;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
};

type ResultView = {
  score: number;
  passed: boolean;
  coinsAwarded: number;
};

export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const startedAt = useMemo(() => new Date().toISOString(), []);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultView | null>(null);

  function toggle(qId: string, optionId: string) {
    setPicked((p) => ({ ...p, [qId]: optionId }));
  }

  async function submit() {
    if (Object.keys(picked).length < quiz.questions.length) {
      if (!confirm("Some questions are blank. Submit anyway?")) return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/assessments/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assessmentId: quiz.assessmentId,
          startedAt,
          answers: quiz.questions.map((q) => ({
            questionId: q.id,
            selectedOptionIds: picked[q.id] ? [picked[q.id]] : [],
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error === "MaxAttemptsReached" ? "Maximum attempts reached" : "Submission failed");
        return;
      }
      setResult({ score: data.score, passed: data.passed, coinsAwarded: data.coinsAwarded });
      if (data.passed) {
        toast.success(data.coinsAwarded > 0 ? `Passed! +${data.coinsAwarded} coins` : "Passed!");
      } else {
        toast(`Score: ${data.score}% (need ${quiz.passThreshold}%)`);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className={result.passed ? "rounded-2xl border border-success/40 bg-success/10 p-8 text-center" : "rounded-2xl border border-warning/40 bg-warning/10 p-8 text-center"}>
        <p className="text-xs font-semibold uppercase tracking-widest">{result.passed ? "Passed" : "Try again"}</p>
        <p className="mt-2 text-5xl font-bold">{result.score}%</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Threshold: {quiz.passThreshold}%
        </p>
        {result.coinsAwarded > 0 && (
          <p className="mt-3 text-sm font-medium text-brand">+{result.coinsAwarded} coins added to your wallet</p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          {result.passed ? (
            <a
              href="/certificates"
              className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
            >
              See your certificate
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setPicked({});
              }}
              className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
            >
              Try again
            </button>
          )}
          <a
            href={`/catalog/${encodeURIComponent(quiz.course.code)}`}
            className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
          >
            Back to course
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4"
    >
      {quiz.questions.map((q, idx) => (
        <fieldset key={q.id} className="rounded-xl border border-border bg-card p-5">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Question {idx + 1} of {quiz.questions.length}
          </legend>
          <p className="mt-1 font-medium">{q.prompt}</p>
          <ul className="mt-3 space-y-2">
            {q.options.map((o) => {
              const selected = picked[q.id] === o.id;
              return (
                <li key={o.id}>
                  <label
                    className={
                      selected
                        ? "flex cursor-pointer items-center gap-3 rounded-md border border-brand bg-brand/10 px-3 py-2 text-sm"
                        : "flex cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm hover:bg-muted"
                    }
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={selected}
                      onChange={() => toggle(q.id, o.id)}
                      className="accent-[var(--color-brand)]"
                    />
                    <span>{o.text}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-sm font-semibold text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit answers
        </button>
      </div>
    </form>
  );
}
