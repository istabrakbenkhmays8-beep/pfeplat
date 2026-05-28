import Image from "next/image";
import Link from "next/link";
import { VendorBadge } from "@/components/ui/VendorBadge";
import { sessionRange } from "@/lib/dates";
import { courseImageFor } from "@/lib/courseImage";
import type { CatalogCourse } from "@/src/repositories/courseRepo";
import type { Vendor } from "@/src/data/seed";

export function CourseCard({ course }: { course: CatalogCourse }) {
  const href = `/catalog/${encodeURIComponent(course.code)}`;
  const imgUrl = courseImageFor(course.category.vendor, 800);

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <Image
          src={imgUrl}
          alt=""
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition group-hover:scale-105"
        />
        {/* Dark gradient bottom for legibility of the code */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center">
          <span className="font-mono text-2xl font-bold tracking-wider text-white drop-shadow-md">
            {course.code}
          </span>
        </div>
        <div className="absolute start-3 top-3">
          <VendorBadge vendor={course.category.vendor as Vendor} />
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
          {course.nextSession && (
            <span className="inline-flex items-center gap-1">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {sessionRange(course.nextSession.startsAt, course.nextSession.endsAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
