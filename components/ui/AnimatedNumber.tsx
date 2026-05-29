"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Counts up from 0 to `value` when scrolled into view.
 * Renders an aria-live="off" span — the value updates many times per second so screen readers
 * shouldn't announce it; the parent label provides context.
 */
export function AnimatedNumber({
  value,
  suffix = "",
  duration = 1.4,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    const start = performance.now();
    function step(t: number) {
      const elapsed = (t - start) / 1000;
      const p = Math.min(1, elapsed / duration);
      // Ease-out cubic for a confident finish.
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} aria-live="off">
      {display.toLocaleString("en-GB")}
      {suffix}
    </span>
  );
}
