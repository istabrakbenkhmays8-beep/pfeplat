import Link from "next/link";
import { Download, Mail, MapPin, Video, Calendar as CalendarIcon, Info } from "lucide-react";
import { requireRole } from "@/lib/session";
import { listUserEnrollments, type UserEnrollmentRow } from "@/src/services/enrollmentService";
import { VendorBadge } from "@/components/ui/VendorBadge";
import { sessionRange } from "@/lib/dates";
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
          Track your progress, download your course handbook, and see where each session takes place.
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
        <div className="grid gap-5 lg:grid-cols-2">
          {rows.map((r) => (
            <EnrolledCard key={r.enrollmentId} row={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function EnrolledCard({ row }: { row: UserEnrollmentRow }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        {row.course.vendor && <VendorBadge vendor={row.course.vendor as Vendor} />}
        <span className="font-mono text-xs font-semibold text-muted-foreground">{row.course.code}</span>
        <StatusPill status={row.status} />
      </div>
      <h2 className="mt-2 line-clamp-2 text-base font-semibold leading-snug">{row.course.title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {row.course.group} - {row.course.durationDays} days
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-semibold">{row.progress}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-brand transition-all" style={{ width: `${row.progress}%` }} />
        </div>
      </div>

      <DeliveryNotice row={row} />

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <a
          href={`/api/courses/${encodeURIComponent(row.course.code)}/handbook`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-brand/40 bg-brand/5 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/10"
        >
          <Download className="h-3.5 w-3.5" />
          Course PDF
        </a>
        <Link
          href={`/learn/${encodeURIComponent(row.course.code)}`}
          className="inline-flex flex-1 items-center justify-center rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-muted"
        >
          Open course
        </Link>
        {row.status !== "completed" && (
          <>
            <Link
              href={`/assessment/${encodeURIComponent(row.course.code)}`}
              className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              Take assessment
            </Link>
            <CompleteCourseButton enrollmentId={row.enrollmentId} />
          </>
        )}
        {row.completedAt && (
          <a
            href={`/api/certificates/${encodeURIComponent(row.enrollmentId)}/pdf`}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-xs font-semibold text-success hover:bg-success/20"
          >
            <Download className="h-3.5 w-3.5" />
            Certificate
          </a>
        )}
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: UserEnrollmentRow["status"] }) {
  if (status === "completed") {
    return <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">Completed</span>;
  }
  if (status === "abandoned") {
    return <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Abandoned</span>;
  }
  return <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">Active</span>;
}

/**
 * The "how this course is delivered" card. Three faces:
 *  1. No upcoming session scheduled -> soft message inviting the user to reach out.
 *  2. On-site session -> big banner with the location + a tip about parking / Wi-Fi.
 *  3. Live online session -> big banner saying "we'll email you the link, watch your inbox".
 */
function DeliveryNotice({ row }: { row: UserEnrollmentRow }) {
  const s = row.nextSession;

  if (!s) {
    return (
      <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-xs">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-semibold">No session scheduled yet</p>
            <p className="mt-0.5 text-muted-foreground">
              We&rsquo;ll add you to the next cohort. Watch your inbox - we&rsquo;ll email you as soon as a date is fixed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (s.mode === "on_site") {
    return (
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs dark:border-blue-500/30 dark:bg-blue-500/10">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 text-blue-700 dark:text-blue-300" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900 dark:text-blue-200">This training is on-site</p>
            <p className="mt-0.5 text-blue-900/80 dark:text-blue-200/80">
              {s.location || "Tunis - Charguia 1 campus"}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-blue-900/70 dark:text-blue-200/70">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span className="font-mono font-semibold">{sessionRange(s.startsAt, s.endsAt)}</span>
            </div>
            <p className="mt-2 text-blue-900/70 dark:text-blue-200/70">
              Doors open 30 min before start. Free parking on-site, Wi-Fi available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs dark:border-emerald-500/30 dark:bg-emerald-500/10">
      <div className="flex items-start gap-2">
        <Video className="mt-0.5 h-4 w-4 text-emerald-700 dark:text-emerald-300" />
        <div className="flex-1">
          <p className="font-semibold text-emerald-900 dark:text-emerald-200">This training is online (live)</p>
          <div className="mt-0.5 flex items-center gap-1.5 text-emerald-900/80 dark:text-emerald-200/80">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span className="font-mono font-semibold">{sessionRange(s.startsAt, s.endsAt)}</span>
          </div>
          <p className="mt-2 inline-flex items-start gap-1.5 text-emerald-900/80 dark:text-emerald-200/80">
            <Mail className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>
              We&rsquo;ll send you the meeting link by email as soon as possible - please check your inbox from time to
              time (and your spam folder, just in case).
            </span>
          </p>
          {s.meetingLink && (
            <a
              href={s.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex h-7 items-center gap-1 rounded-md bg-emerald-700 px-2.5 text-[11px] font-semibold text-white hover:bg-emerald-800"
            >
              <Video className="h-3 w-3" />
              Join meeting
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
