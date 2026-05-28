import { cn } from "@/lib/cn";

export function KpiCard({
  value,
  label,
  hint,
  className,
}: {
  value: string | number;
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6", className)}>
      <p className="text-4xl font-bold tracking-tight text-brand sm:text-5xl">{value}</p>
      <p className="mt-2 text-sm font-medium text-fg">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
