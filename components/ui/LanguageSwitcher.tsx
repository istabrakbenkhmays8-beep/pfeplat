"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Globe } from "lucide-react";
import { setLocale } from "@/lib/localeActions";

const options = [
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "ar", label: "العربية", short: "AR" },
] as const;

export function LanguageSwitcher({ current = "en" }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const active = options.find((o) => o.code === current) ?? options[0];

  function choose(code: string) {
    setOpen(false);
    startTransition(async () => {
      await setLocale(code);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Change language"
        disabled={pending}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-medium text-fg transition hover:bg-muted disabled:opacity-60"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span>{active.short}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <ul className="p-1">
            {options.map((o) => (
              <li key={o.code}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => choose(o.code)}
                  className={
                    o.code === current
                      ? "flex w-full items-center justify-between rounded-md bg-brand px-3 py-2 text-sm font-medium text-brand-foreground"
                      : "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-fg hover:bg-muted"
                  }
                >
                  <span>{o.label}</span>
                  <span className="text-xs opacity-70">{o.short}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
