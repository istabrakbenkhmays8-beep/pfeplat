"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Video, Users, Calendar as CalendarIcon } from "lucide-react";
import { VendorBadge } from "@/components/ui/VendorBadge";
import { sessionRange } from "@/lib/dates";
import { cn } from "@/lib/cn";
import type { Vendor } from "@/src/data/seed";

export type SessionRow = {
  id: string;
  courseCode: string;
  courseTitle: string;
  vendor: string;
  group: string;
  durationDays: number;
  mode: "live_online" | "on_site";
  status: string;
  /** ISO strings (UTC) */
  startsAt: string;
  endsAt: string;
  location: string | null;
  meetingLink: string | null;
  capacity: number;
  enrolledCount: number;
  reservation: { status: string } | null;
  enrolled: boolean;
};

type Filter = "all" | "mine" | "online" | "onsite";

/** All UTC day keys a session spans, inclusive of start + end days. */
function daysSpanned(start: string, end: string): string[] {
  const s = new Date(start);
  const e = new Date(end);
  const out: string[] = [];
  // Walk day-by-day in UTC so timezone shifts don't smear sessions across days.
  const cur = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
  const last = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate()));
  while (cur.getTime() <= last.getTime()) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

function ModeIcon({ mode, className }: { mode: "live_online" | "on_site"; className?: string }) {
  return mode === "live_online" ? <Video className={className} /> : <MapPin className={className} />;
}

function ReservationBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
    approved: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
    rejected: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200",
    attended: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
    cancelled: "bg-muted text-muted-foreground",
    no_show: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", map[status] ?? "bg-muted text-fg")}>
      {status.replace("_", " ")}
    </span>
  );
}

function isJoinable(row: SessionRow): boolean {
  if (row.mode !== "live_online" || !row.meetingLink) return false;
  if (row.status !== "confirmed" && row.status !== "in_progress") return false;
  const start = new Date(row.startsAt).getTime();
  const end = new Date(row.endsAt).getTime();
  const now = Date.now();
  return now >= start - 24 * 60 * 60 * 1000 && now <= end;
}

export function CalendarView({ rows }: { rows: SessionRow[] }) {
  // Anchor month: the month of the earliest upcoming session, or the current month if list is empty.
  const initialMonth = useMemo(() => {
    if (rows.length === 0) {
      const now = new Date();
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    }
    const first = new Date(rows[0].startsAt);
    return new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1));
  }, [rows]);

  const [monthAnchor, setMonthAnchor] = useState<Date>(initialMonth);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Apply filter + search to the whole dataset once. The calendar grid + the side list both work from this.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "mine" && !r.enrolled && !r.reservation) return false;
      if (filter === "online" && r.mode !== "live_online") return false;
      if (filter === "onsite" && r.mode !== "on_site") return false;
      if (q) {
        const hay = `${r.courseCode} ${r.courseTitle} ${r.vendor} ${r.group}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filter, search]);

  // Index sessions by day key so the grid can paint busy days in O(1).
  const byDay = useMemo(() => {
    const map = new Map<string, SessionRow[]>();
    for (const r of filtered) {
      for (const k of daysSpanned(r.startsAt, r.endsAt)) {
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(r);
      }
    }
    return map;
  }, [filtered]);

  const mineCount = rows.filter((r) => r.enrolled || r.reservation).length;

  // Build the 6×7 grid of days for the current month anchor (Monday-first).
  const days = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);
  const monthLabel = monthAnchor.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

  // Selected day's sessions; if no day is picked, show all visible sessions for the month.
  const visibleSessions = useMemo(() => {
    if (selectedDay) return byDay.get(selectedDay) ?? [];
    const monthStr = monthAnchor.toISOString().slice(0, 7); // "2026-06"
    return filtered.filter((r) => {
      // A session is "in this month" if any of its days fall in the month.
      const days = daysSpanned(r.startsAt, r.endsAt);
      return days.some((d) => d.startsWith(monthStr));
    });
  }, [byDay, selectedDay, filtered, monthAnchor]);

  function shiftMonth(delta: number) {
    const next = new Date(Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth() + delta, 1));
    setMonthAnchor(next);
    setSelectedDay(null);
  }

  function jumpToToday() {
    const now = new Date();
    setMonthAnchor(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
    setSelectedDay(null);
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <FilterPills value={filter} onChange={setFilter} mineCount={mineCount} totalCount={rows.length} />
        <div className="ms-auto flex flex-1 items-center gap-2 sm:flex-none sm:min-w-[260px]">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course, code, vendor…"
            className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Month grid */}
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={jumpToToday}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium hover:bg-muted"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Today
            </button>
          </div>

          {/* Weekday header — Mon-first to match the FR brochure */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((d) => {
              const k = d.key;
              const items = byDay.get(k) ?? [];
              const isOtherMonth = !d.inMonth;
              const isToday = k === new Date().toISOString().slice(0, 10);
              const isSelected = selectedDay === k;
              const hasMine = items.some((r) => r.enrolled || r.reservation);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelectedDay(items.length ? (isSelected ? null : k) : null)}
                  className={cn(
                    "group relative flex min-h-[72px] flex-col items-stretch rounded-md border p-1.5 text-left transition",
                    isOtherMonth ? "border-transparent bg-transparent text-muted-foreground/50" : "border-border bg-surface hover:border-brand/40",
                    isSelected && "border-brand bg-brand/5 ring-1 ring-brand/30",
                    !items.length && "cursor-default hover:border-border",
                  )}
                  aria-pressed={isSelected}
                  aria-label={`${d.dayNum} — ${items.length} session${items.length === 1 ? "" : "s"}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                        isToday && "bg-brand text-brand-foreground",
                      )}
                    >
                      {d.dayNum}
                    </span>
                    {items.length > 0 && (
                      <span className="text-[10px] font-semibold text-muted-foreground">{items.length}</span>
                    )}
                  </div>

                  {/* Dots / mini chips for sessions on this day */}
                  <div className="mt-1 space-y-0.5">
                    {items.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[10px] font-medium",
                          r.enrolled || r.reservation
                            ? "bg-brand/20 text-brand"
                            : r.mode === "live_online"
                            ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200"
                            : "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200",
                        )}
                        title={`${r.courseCode} — ${r.courseTitle}`}
                      >
                        {r.courseCode}
                      </div>
                    ))}
                    {items.length > 2 && (
                      <div className="text-[10px] font-medium text-muted-foreground">+{items.length - 2} more</div>
                    )}
                  </div>

                  {hasMine && !isOtherMonth && (
                    <span
                      aria-hidden
                      className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" /> Yours
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-500/30" /> Live online
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm bg-blue-200 dark:bg-blue-500/30" /> On-site
            </span>
          </div>
        </section>

        {/* Side list (selected day OR whole month) */}
        <aside className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {selectedDay
                ? new Date(selectedDay + "T00:00:00Z").toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    timeZone: "UTC",
                  })
                : `All sessions in ${monthLabel}`}
            </h3>
            {selectedDay && (
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="text-xs font-medium text-brand hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {visibleSessions.length === 0 ? (
            <EmptyState filterActive={filter !== "all" || search.length > 0} />
          ) : (
            <ul className="space-y-3">
              {visibleSessions.map((r) => (
                <li key={r.id}>
                  <SessionCard row={r} />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

function FilterPills({
  value,
  onChange,
  mineCount,
  totalCount,
}: {
  value: Filter;
  onChange: (f: Filter) => void;
  mineCount: number;
  totalCount: number;
}) {
  const pills: Array<{ id: Filter; label: string; count?: number }> = [
    { id: "all", label: "All", count: totalCount },
    { id: "mine", label: "Yours", count: mineCount },
    { id: "online", label: "Live online" },
    { id: "onsite", label: "On-site" },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {pills.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition",
            value === p.id
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border bg-surface text-fg hover:bg-muted",
          )}
        >
          {p.label}
          {typeof p.count === "number" && (
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px]",
                value === p.id ? "bg-brand-foreground/20" : "bg-muted text-muted-foreground",
              )}
            >
              {p.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ filterActive }: { filterActive: boolean }) {
  if (filterActive) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Nothing matches those filters. Try clearing them.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center">
      <p className="text-sm font-semibold">Nothing here yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Enroll in a course or reserve a session to fill your calendar.
      </p>
      <Link
        href="/catalog"
        className="mt-3 inline-flex h-9 items-center rounded-md bg-brand px-3 text-xs font-semibold text-brand-foreground hover:bg-brand-600"
      >
        Browse courses
      </Link>
    </div>
  );
}

function SessionCard({ row }: { row: SessionRow }) {
  const joinable = isJoinable(row);
  const isMine = row.enrolled || !!row.reservation;
  return (
    <article
      className={cn(
        "rounded-lg border bg-surface p-3 transition hover:shadow-sm",
        isMine ? "border-brand/40" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {row.vendor && <VendorBadge vendor={row.vendor as Vendor} />}
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-fg">
          <ModeIcon mode={row.mode} className="h-3 w-3" />
          {row.mode === "live_online" ? "Live online" : "On-site"}
        </span>
        {row.reservation && <ReservationBadge status={row.reservation.status} />}
        {row.enrolled && !row.reservation && (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">Enrolled</span>
        )}
        <span className="ms-auto font-mono text-[10px] font-semibold text-muted-foreground">{row.courseCode}</span>
      </div>

      <Link
        href={`/catalog/${encodeURIComponent(row.courseCode)}`}
        className="mt-1.5 block text-sm font-semibold leading-snug hover:text-brand"
      >
        {row.courseTitle}
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="font-mono font-semibold text-fg">{sessionRange(row.startsAt, row.endsAt)}</span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" />
          {row.enrolledCount}/{row.capacity}
        </span>
        {row.mode === "on_site" && row.location && (
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3" />
            {row.location}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-end gap-2">
        {joinable ? (
          <a
            href={row.meetingLink!}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-7 items-center rounded-md bg-brand px-2.5 text-[11px] font-semibold text-brand-foreground hover:bg-brand-600"
          >
            Join meeting
          </a>
        ) : (
          <Link
            href={`/catalog/${encodeURIComponent(row.courseCode)}`}
            className="inline-flex h-7 items-center rounded-md border border-border bg-surface px-2.5 text-[11px] font-medium hover:bg-muted"
          >
            {isMine ? "Course details" : "Enroll / reserve"}
          </Link>
        )}
      </div>
    </article>
  );
}

/** Build a 6×7 (sometimes 5×7) Mon-first grid of day cells for the given month anchor. */
function buildMonthGrid(monthAnchor: Date): Array<{ key: string; dayNum: number; inMonth: boolean }> {
  const year = monthAnchor.getUTCFullYear();
  const month = monthAnchor.getUTCMonth();
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  // JS Sunday=0..Saturday=6; we want Monday=0..Sunday=6
  const jsDow = firstOfMonth.getUTCDay();
  const mondayOffset = (jsDow + 6) % 7;
  // Start grid on the Monday on/before the 1st.
  const gridStart = new Date(Date.UTC(year, month, 1 - mondayOffset));
  const cells: Array<{ key: string; dayNum: number; inMonth: boolean }> = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(Date.UTC(gridStart.getUTCFullYear(), gridStart.getUTCMonth(), gridStart.getUTCDate() + i));
    cells.push({
      key: d.toISOString().slice(0, 10),
      dayNum: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month,
    });
  }
  // Trim trailing all-out-of-month week to keep the grid tight.
  while (cells.length > 35 && cells.slice(-7).every((c) => !c.inMonth)) cells.splice(-7);
  return cells;
}
