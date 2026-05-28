import { cn } from "@/lib/cn";
import type { Vendor } from "@/src/data/seed";

const palette: Record<Vendor, string> = {
  Cisco: "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200",
  Microsoft: "bg-cyan-100 text-cyan-900 dark:bg-cyan-500/20 dark:text-cyan-200",
  Fortinet: "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200",
  PaloAlto: "bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200",
  IBM: "bg-slate-200 text-slate-900 dark:bg-slate-500/20 dark:text-slate-100",
  "EC-Council": "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
  PECB: "bg-purple-100 text-purple-900 dark:bg-purple-500/20 dark:text-purple-200",
  PeopleCert: "bg-pink-100 text-pink-900 dark:bg-pink-500/20 dark:text-pink-200",
  PMI: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  Togaf: "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-200",
  Linux: "bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200",
};

export function VendorBadge({ vendor, className }: { vendor: Vendor; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        palette[vendor] ?? "bg-muted text-fg",
        className,
      )}
    >
      {vendor}
    </span>
  );
}
