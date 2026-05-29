"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Check,
  Eye,
  Loader2,
  Send,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";

type Proposal = {
  id: string;
  toolUseId: string;
  name: string;
  description: string;
  input: Record<string, unknown>;
  resumeContext: unknown[];
  /** Local UI state — not sent over the wire. */
  status?: "pending" | "approved" | "rejected" | "running";
  followUp?: string;
};

type AssistantTurn = {
  role: "assistant";
  content: string;
  proposals: Proposal[];
};

type UserTurn = { role: "user"; content: string };

type Turn = UserTurn | AssistantTurn;

const SUGGESTIONS = [
  "What needs my attention right now?",
  "Show me all pending reservations.",
  "Which upcoming sessions still need a trainer?",
  "Create a new course for Microsoft AI-900 (1 day, beginner, 600 DT).",
];

export function AgentChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, busy]);

  async function send(message: string) {
    const text = message.trim();
    if (!text || busy) return;
    setInput("");
    const newUserTurn: UserTurn = { role: "user", content: text };
    const history = turns.map((t) => ({ role: t.role, content: t.content }));
    setTurns((prev) => [...prev, newUserTurn]);
    setBusy(true);

    try {
      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Agent failed");
        setTurns((prev) => [
          ...prev,
          { role: "assistant", content: "Something went wrong on my end. Try again?", proposals: [] },
        ]);
        return;
      }
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "(no reply)",
          proposals: (data.proposals ?? []).map((p: Proposal) => ({ ...p, status: "pending" })),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function decide(turnIdx: number, proposalId: string, approve: boolean) {
    setTurns((prev) =>
      prev.map((t, i) => {
        if (i !== turnIdx || t.role !== "assistant") return t;
        return {
          ...t,
          proposals: t.proposals.map((p) =>
            p.id === proposalId
              ? { ...p, status: approve ? "running" : "rejected" }
              : p,
          ),
        };
      }),
    );

    if (!approve) {
      toast("Proposal rejected");
      return;
    }

    const turn = turns[turnIdx];
    if (!turn || turn.role !== "assistant") return;
    const proposal = turn.proposals.find((p) => p.id === proposalId);
    if (!proposal) return;

    try {
      const res = await fetch("/api/ai/agent/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ proposal }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Execution failed");
        setTurns((prev) =>
          prev.map((t, i) => {
            if (i !== turnIdx || t.role !== "assistant") return t;
            return {
              ...t,
              proposals: t.proposals.map((p) =>
                p.id === proposalId ? { ...p, status: "rejected" } : p,
              ),
            };
          }),
        );
        return;
      }
      toast.success("Done");
      setTurns((prev) =>
        prev.map((t, i) => {
          if (i !== turnIdx || t.role !== "assistant") return t;
          return {
            ...t,
            proposals: t.proposals.map((p) =>
              p.id === proposalId
                ? { ...p, status: "approved", followUp: data.followUp }
                : p,
            ),
          };
        }),
      );
    } catch (err: any) {
      toast.error(err?.message ?? "Network error");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div ref={scrollRef} className="max-h-[640px] min-h-[400px] overflow-y-auto p-5">
        {turns.length === 0 && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.6 }}
              className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground"
            >
              <Sparkles className="h-7 w-7" />
            </motion.div>
            <p className="mt-3 text-sm font-medium">Hi, I&apos;m Avi.</p>
            <p className="mt-1 text-xs text-muted-foreground">Try one of these to get started:</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg transition hover:border-brand/50 hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {turns.map((turn, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {turn.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl bg-brand px-4 py-2 text-sm text-brand-foreground">
                      {turn.content}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {turn.content && (
                      <div className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <div className="prose prose-sm max-w-[85%] whitespace-pre-wrap rounded-2xl bg-muted px-4 py-2.5 text-sm text-fg dark:prose-invert">
                          {turn.content}
                        </div>
                      </div>
                    )}
                    {turn.proposals.map((p) => (
                      <ProposalCard
                        key={p.id}
                        proposal={p}
                        onDecide={(approve) => decide(idx, p.id, approve)}
                      />
                    ))}
                  </div>
                )}
              </motion.li>
            ))}
          </AnimatePresence>

          {busy && (
            <li className="flex items-center gap-3 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking…
            </li>
          )}
        </ul>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={2}
          placeholder="Ask Avi anything… (Enter to send, Shift+Enter for new line)"
          disabled={busy}
          className="flex-1 resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand text-brand-foreground transition hover:bg-brand-600 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function ProposalCard({
  proposal,
  onDecide,
}: {
  proposal: Proposal;
  onDecide: (approve: boolean) => void;
}) {
  const [showInput, setShowInput] = useState(false);
  const isDone = proposal.status === "approved" || proposal.status === "rejected";

  const toneByStatus: Record<NonNullable<Proposal["status"]>, string> = {
    pending: "border-warning/40 bg-warning/5",
    running: "border-warning/40 bg-warning/10",
    approved: "border-success/40 bg-success/10",
    rejected: "border-muted-foreground/30 bg-muted/40 opacity-70",
  };
  const tone = toneByStatus[proposal.status ?? "pending"];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`ms-10 rounded-xl border p-4 ${tone}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Proposed action — needs your approval
          </p>
          <p className="mt-1 font-mono text-sm font-bold">{proposal.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{proposal.description}</p>

          <button
            type="button"
            onClick={() => setShowInput((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            <Eye className="h-3 w-3" />
            {showInput ? "Hide" : "Show"} arguments
          </button>

          <AnimatePresence>
            {showInput && (
              <motion.pre
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-x-auto rounded-md border border-border bg-card p-3 text-xs"
              >
                {JSON.stringify(proposal.input, null, 2)}
              </motion.pre>
            )}
          </AnimatePresence>

          {proposal.followUp && (
            <div className="mt-3 rounded-md border border-success/30 bg-success/5 p-3 text-xs">
              <p className="font-semibold text-success">Done.</p>
              <p className="mt-1 whitespace-pre-wrap text-fg">{proposal.followUp}</p>
            </div>
          )}

          {!isDone && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={proposal.status === "running"}
                onClick={() => onDecide(true)}
                className="inline-flex h-8 items-center gap-1 rounded-md bg-success px-3 text-xs font-semibold text-white hover:bg-success/90 disabled:opacity-60"
              >
                {proposal.status === "running" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                Approve & run
              </button>
              <button
                type="button"
                disabled={proposal.status === "running"}
                onClick={() => onDecide(false)}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium text-fg hover:bg-muted disabled:opacity-60"
              >
                <X className="h-3 w-3" />
                Reject
              </button>
            </div>
          )}

          {proposal.status === "rejected" && !proposal.followUp && (
            <p className="mt-2 text-xs text-muted-foreground">Rejected — nothing was changed.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
