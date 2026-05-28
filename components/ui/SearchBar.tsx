"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

type Suggestion = {
  code: string;
  title: string;
  vendor: string;
  group: string;
};

type Props = {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
};

const heights = { sm: "h-9", md: "h-11", lg: "h-14" } as const;
const textSize = { sm: "text-sm", md: "text-sm", lg: "text-base" } as const;

export function SearchBar({
  defaultValue = "",
  placeholder = "Search courses, vendors, certifications…",
  className,
  size = "md",
  autoFocus,
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Close dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced fetch.
  useEffect(() => {
    if (q.trim().length < 1) {
      setItems([]);
      setOpen(false);
      return;
    }
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetch(`/api/catalog/suggest?q=${encodeURIComponent(q)}`, {
          signal: ac.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { items: Suggestion[] };
        setItems(data.items);
        setOpen(data.items.length > 0);
        setActiveIndex(-1);
      } catch {
        /* aborted */
      }
    }, 180);
    return () => clearTimeout(handle);
  }, [q]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setOpen(false);
    if (activeIndex >= 0 && activeIndex < items.length) {
      router.push(`/catalog/${encodeURIComponent(items[activeIndex].code)}`);
      return;
    }
    if (q.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(q.trim())}`);
    } else {
      router.push("/catalog");
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(-1, i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <form
        onSubmit={submit}
        role="search"
        className="relative flex w-full items-center"
      >
        <span aria-hidden className="pointer-events-none absolute start-3 text-muted-foreground">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => items.length > 0 && setOpen(true)}
          placeholder={placeholder}
          aria-label="Search courses"
          autoFocus={autoFocus}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-suggestions"
          className={cn(
            "w-full rounded-full border border-border bg-surface ps-10 pe-24 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20",
            heights[size],
            textSize[size],
          )}
        />
        <button
          type="submit"
          className={cn(
            "absolute end-1 inline-flex items-center justify-center rounded-full bg-brand px-4 font-medium text-brand-foreground hover:bg-brand-600",
            size === "sm" ? "h-7 text-xs" : size === "lg" ? "h-12 text-sm" : "h-9 text-sm",
          )}
        >
          Search
        </button>
      </form>

      {open && items.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl"
        >
          {items.map((s, i) => (
            <li key={s.code}>
              <Link
                href={`/catalog/${encodeURIComponent(s.code)}`}
                role="option"
                aria-selected={i === activeIndex}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm",
                  i === activeIndex ? "bg-muted" : "hover:bg-muted",
                )}
              >
                <span className="font-mono text-xs font-semibold text-brand">{s.code}</span>
                <span className="min-w-0 flex-1 truncate">{s.title}</span>
                <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                  {s.vendor} · {s.group}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push(`/catalog?q=${encodeURIComponent(q.trim())}`);
              }}
              className="flex w-full items-center justify-between border-t border-border bg-muted/40 px-4 py-2 text-xs font-medium text-brand hover:bg-muted"
            >
              <span>See all results for &ldquo;{q.trim()}&rdquo;</span>
              <span aria-hidden>→</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
