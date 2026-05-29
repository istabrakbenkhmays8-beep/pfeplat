"use client";

import { useTransition } from "react";
import { setLocale } from "@/lib/localeActions";

/**
 * Tunisian flag pill. Sets the Arabic locale on click and scrolls to the office anchor.
 * Other countries removed per design — this is a Tunisia-first platform.
 */
function FlagTN() {
  return (
    <svg viewBox="0 0 3 2" aria-hidden className="block h-full w-full">
      <rect width="3" height="2" fill="#E70013" />
      <circle cx="1.5" cy="1" r="0.45" fill="#FFFFFF" />
      <circle cx="1.55" cy="1" r="0.35" fill="#E70013" />
      <circle cx="1.62" cy="1" r="0.28" fill="#FFFFFF" />
      <polygon
        points="1.62,0.72 1.685,0.92 1.895,0.92 1.725,1.04 1.79,1.24 1.62,1.12 1.45,1.24 1.515,1.04 1.345,0.92 1.555,0.92"
        fill="#E70013"
      />
    </svg>
  );
}

export function CountryFlags() {
  const [pending, startTransition] = useTransition();

  function pick() {
    startTransition(async () => {
      await setLocale("ar");
      const target = document.getElementById("tunisia");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={pick}
        aria-label="Tunisia — switch to Arabic"
        title="Tunisia"
        disabled={pending}
        className="inline-flex h-6 w-6 overflow-hidden rounded-full ring-2 ring-white/70 transition hover:ring-white disabled:opacity-60"
      >
        <FlagTN />
      </button>
      <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider opacity-90">
        Tunisia first · proud Tunisian platform
      </span>
    </div>
  );
}
