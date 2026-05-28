"use client";

import { useTransition } from "react";
import { setLocale } from "@/lib/localeActions";

type Country = {
  code: "FR" | "MA" | "TN" | "CI";
  label: string;
  /** Which locale this flag maps to when clicked. */
  locale: "en" | "fr" | "ar";
  /** Office anchor in /about for deep-linking. */
  anchor: string;
  svg: React.ReactNode;
};

const COUNTRIES: Country[] = [
  {
    code: "FR",
    label: "France",
    locale: "fr",
    anchor: "france",
    svg: (
      <svg viewBox="0 0 3 2" aria-hidden className="block h-full w-full">
        <rect width="1" height="2" x="0" fill="#0055A4" />
        <rect width="1" height="2" x="1" fill="#FFFFFF" />
        <rect width="1" height="2" x="2" fill="#EF4135" />
      </svg>
    ),
  },
  {
    code: "MA",
    label: "Maroc",
    locale: "fr",
    anchor: "morocco",
    svg: (
      <svg viewBox="0 0 3 2" aria-hidden className="block h-full w-full">
        <rect width="3" height="2" fill="#C1272D" />
        <g transform="translate(1.5 1) scale(0.35)" fill="none" stroke="#006233" strokeWidth="0.1">
          <polygon points="0,-1 0.225,-0.31 0.951,-0.31 0.363,0.118 0.588,0.809 0,0.382 -0.588,0.809 -0.363,0.118 -0.951,-0.31 -0.225,-0.31" />
        </g>
      </svg>
    ),
  },
  {
    code: "TN",
    label: "Tunisie",
    locale: "ar",
    anchor: "tunisia",
    svg: (
      <svg viewBox="0 0 3 2" aria-hidden className="block h-full w-full">
        <rect width="3" height="2" fill="#E70013" />
        <circle cx="1.5" cy="1" r="0.45" fill="#FFFFFF" />
        <circle cx="1.55" cy="1" r="0.35" fill="#E70013" />
        <circle cx="1.62" cy="1" r="0.28" fill="#FFFFFF" />
        <polygon points="1.62,0.72 1.685,0.92 1.895,0.92 1.725,1.04 1.79,1.24 1.62,1.12 1.45,1.24 1.515,1.04 1.345,0.92 1.555,0.92" fill="#E70013" />
      </svg>
    ),
  },
  {
    code: "CI",
    label: "Côte d'Ivoire",
    locale: "fr",
    anchor: "cote-divoire",
    svg: (
      <svg viewBox="0 0 3 2" aria-hidden className="block h-full w-full">
        <rect width="1" height="2" x="0" fill="#F77F00" />
        <rect width="1" height="2" x="1" fill="#FFFFFF" />
        <rect width="1" height="2" x="2" fill="#009E60" />
      </svg>
    ),
  },
];

export function CountryFlags() {
  const [pending, startTransition] = useTransition();

  function pick(c: Country) {
    startTransition(async () => {
      await setLocale(c.locale);
      // Soft scroll to the office anchor on /about if we're on that page.
      const target = document.getElementById(c.anchor);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  return (
    <ul className="flex items-center gap-2">
      {COUNTRIES.map((c) => (
        <li key={c.code}>
          <button
            type="button"
            onClick={() => pick(c)}
            aria-label={`${c.label} — set language`}
            title={c.label}
            disabled={pending}
            className="inline-flex h-6 w-6 overflow-hidden rounded-full ring-2 ring-white/70 transition hover:ring-white disabled:opacity-60"
          >
            {c.svg}
          </button>
        </li>
      ))}
    </ul>
  );
}
