"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Sparkles, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Message = { role: "user" | "assistant"; content: string };

const ASSISTANT_NAME_BY_ROLE: Record<string, { name: string; tag: string }> = {
  super_admin: { name: "Avi", tag: "Operations agent" },
  admin: { name: "Adi", tag: "Admin assistant" },
  user: { name: "Ada", tag: "Learning assistant" },
};

export function ChatWidget() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm here to help you decide what to learn next, explain certifications, or check your coins. Ask me anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || configured !== null) return;
    fetch("/api/ai/chat", { method: "GET" })
      .then((r) => r.json())
      .then((d) => setConfigured(!!d.configured))
      .catch(() => setConfigured(false));
  }, [open, configured]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy, open]);

  if (status !== "authenticated" || !session?.user) return null;

  const role = session.user.role ?? "user";
  const assistant = ASSISTANT_NAME_BY_ROLE[role] ?? ASSISTANT_NAME_BY_ROLE.user;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: text }, { role: "assistant", content: "" }];
    setMessages(next);
    setBusy(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messages: next.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        const msg =
          body?.error === "AINotConfigured"
            ? "The AI assistant isn't configured yet. Set ANTHROPIC_API_KEY in .env to enable it."
            : "Something went wrong. Please try again.";
        setConfigured(body?.error === "AINotConfigured" ? false : configured);
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: msg };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() ?? "";
        for (const evt of events) {
          const lines = evt.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;
          const eventType = eventLine.slice("event:".length).trim();
          const payload = JSON.parse(dataLine.slice("data:".length).trim());
          if (eventType === "meta" && payload.conversationId) {
            setConversationId(payload.conversationId);
          } else if (eventType === "token" && payload.token) {
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { ...last, content: last.content + payload.token };
              return copy;
            });
          } else if (eventType === "error") {
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = {
                role: "assistant",
                content: "Sorry — something interrupted the response.",
              };
              return copy;
            });
          }
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open ${assistant.name}, your assistant`}
          className="fixed bottom-5 end-5 z-50 inline-flex h-14 items-center gap-2 rounded-full bg-brand ps-4 pe-5 text-sm font-semibold text-brand-foreground shadow-xl hover:bg-brand-600"
        >
          <Sparkles className="h-5 w-5" />
          Ask {assistant.name}
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 end-5 z-50 flex h-[560px] w-[min(96vw,400px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <header className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-brand to-brand-700 px-4 py-3 text-brand-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{assistant.name}</p>
                <p className="text-xs opacity-80">{assistant.tag}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md p-1 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
            {configured === false && (
              <div className="mb-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                Heads up: the AI assistant isn&apos;t configured yet. Once an admin adds{" "}
                <code className="rounded bg-warning/10 px-1">ANTHROPIC_API_KEY</code> in <code className="rounded bg-warning/10 px-1">.env</code>,
                I&apos;ll come to life.
              </div>
            )}

            <ul className="space-y-3">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ms-auto bg-brand text-brand-foreground"
                      : "bg-muted text-fg",
                  )}
                >
                  {m.content || (busy && i === messages.length - 1 ? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> thinking…
                    </span>
                  ) : null)}
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-border p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={`Message ${assistant.name}… (Enter to send)`}
                rows={2}
                disabled={busy}
                className="flex-1 resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
