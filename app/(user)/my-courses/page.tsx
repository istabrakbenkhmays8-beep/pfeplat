import Link from "next/link";
import { requireRole } from "@/lib/session";
import { listUserEnrollments } from "@/src/services/enrollmentService";
import { VendorBadge } from "@/components/ui/VendorBadge";
import { CompleteCourseButton } from "./CompleteCourseButton";
import type { Vendor } from "@/src/data/seed";

export const metadata = { title: "My courses" };
export const dynamic = "force-dynamic";

export default async function MyCoursesPage() {
  const session = await requireRole("user");
  const rows = await listUserEnrollments(session.user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">My courses</h1>
        <p className="text-sm text-muted-foreground">
          Track your progress and pick up where you left off.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-lg font-semibold">No enrollments yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse the catalog and enroll in your first course.
          </p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <article
              key={r.enrollmentId}
              className="flex h-full flex-col rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <VendorBadge vendor={r.course.vendor as Vendor} />
                <span className="font-mono text-xs font-semibold text-muted-foreground">
                  {r.course.code}
                </span>
              </div>
              <h2 className="mt-2 line-clamp-2 font-semibold leading-snug">{r.course.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.course.group} · {r.course.durationDays} days
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-semibold">{r.progress}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-brand transition-all"
                    style={{ width: `${r.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs">
                <span
                  className={
                    r.status === "completed"
                      ? "rounded-full bg-success/10 px-2 py-0.5 font-medium text-success"
                      : "rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand"
                  }
                >
                  {r.status === "completed" ? "Completed" : r.status === "abandoned" ? "Abandoned" : "Active"}
                </span>
                {r.completedAt && (
                  <span className="text-muted-foreground">
                    on {new Date(r.completedAt).toLocaleDateString("en-GB")}
                  </span>
                )}
              </div>

              <div className="mt-auto flex gap-2 pt-4">
                <Link
                  href={`/catalog/${encodeURIComponent(r.course.code)}`}
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-muted"
                >
                  Open course
                </Link>
                {r.status !== "completed" && (
                  <CompleteCourseButton enrollmentId={r.enrollmentId} />
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
