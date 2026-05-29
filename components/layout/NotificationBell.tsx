"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  readAt: string | null;
  createdAt: string;
};

type ApiResponse = {
  items: Notification[];
  unreadCount: number;
};

/** Polling cadence — the bell badge re-checks the server every 30s while open
 *  (60s while closed). Cheap enough to skip a websocket. */
const POLL_OPEN_MS = 30_000;
const POLL_CLOSED_MS = 60_000;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=20", { cache: "no-store" });
      if (!res.ok) return;
      const body = (await res.json()) as ApiResponse;
      setItems(body.items);
      setUnread(body.unreadCount);
    } finally {
      setLoading(false);
    }
  }

  // Initial load + interval poll. We use a single interval and just change its
  // cadence via dependency on `open` — the effect re-creates the interval when
  // the dropdown toggles.
  useEffect(() => {
    refresh();
    const ms = open ? POLL_OPEN_MS : POLL_CLOSED_MS;
    const id = window.setInterval(refresh, ms);
    return () => window.clearInterval(id);
  }, [open]);

  // Close the popover when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function openOne(n: Notification) {
    // Optimistic: mark as read locally so the badge updates instantly.
    if (!n.readAt) {
      setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
      setUnread((c) => Math.max(0, c - 1));
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {});
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  async function markAll() {
    if (unread === 0) return;
    setItems((cur) => cur.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })));
    setUnread(0);
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    }).catch(() => {});
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-fg hover:bg-muted"
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <span className="absolute -top-1 -end-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-brand-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute end-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] origin-top-end rounded-xl border border-border bg-card shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {unread > 0 ? `${unread} unread` : "All caught up"}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium hover:bg-muted"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center px-4 py-10 text-sm text-muted-foreground">
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                <p>No notifications yet.</p>
                <p className="mt-1 text-xs">We&rsquo;ll ping you when there&rsquo;s something new.</p>
              </div>
            ) : (
              <ul>
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => openOne(n)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted ${
                        n.readAt ? "" : "bg-brand/5"
                      }`}
                    >
                      <span
                        className={`mt-1.5 inline-block h-2 w-2 flex-shrink-0 rounded-full ${
                          n.readAt ? "bg-transparent" : "bg-brand"
                        }`}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-snug">{n.title}</span>
                        {n.body && (
                          <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">{n.body}</span>
                        )}
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {formatAgo(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Tiny "5 min ago" formatter — keeps the dropdown UI dependency-free. */
function formatAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const sec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (sec < 45) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}
