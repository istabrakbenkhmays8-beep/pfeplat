import { cn } from "@/lib/cn";
import { AnimatedNumber } from "./AnimatedNumber";

export function KpiCard({
  value,
  label,
  hint,
  className,
}: {
  /** Plain string ("30+") OR a pure number (animated count-up). */
  value: string | number;
  label: string;
  hint?: string;
  className?: string;
}) {
  // If `value` is a string with an embedded number ("30+", "10k+"), pull the integer and animate it.
  const parsed = typeof value === "string" ? parseInt(value, 10) : value;
  const isNum = Number.isFinite(parsed);
  const suffix = typeof value === "string" ? value.replace(String(parsed), "") : "";

  return (
    <div className={cn("group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md", className)}>
      <p className="text-4xl font-bold tracking-tight text-brand sm:text-5xl">
        {isNum ? <AnimatedNumber value={parsed as number} suffix={suffix} /> : value}
      </p>
      <p className="mt-2 text-sm font-medium text-fg">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
