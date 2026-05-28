import Link from "next/link";
import { sessionRange, type EnrichedCourse } from "@/src/data/queries";
import { VendorBadge } from "@/components/ui/VendorBadge";

export function CourseCard({ course }: { course: EnrichedCourse }) {
  const href = `/catalog/${encodeURIComponent(course.code)}`;
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand/15 via-transparent to-muted">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(20rem 12rem at 20% 0%, color-mix(in oklab, var(--color-brand) 30%, transparent), transparent), radial-gradient(20rem 12rem at 100% 100%, color-mix(in oklab, var(--color-brand) 18%, transparent), transparent)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-2xl font-bold tracking-wider text-fg/80">{course.code}</span>
        </div>
        <div className="absolute start-3 top-3">
          <VendorBadge vendor={course.category.vendor} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-muted-foreground">{course.category.name}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">{course.title}</h3>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {course.durationDays} {course.durationDays === 1 ? "day" : "days"}
          </span>
          {course.juneSession && (
            <span className="inline-flex items-center gap-1">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {sessionRange(course.juneSession.start, course.juneSession.end)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
