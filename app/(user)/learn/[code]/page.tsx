import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  MapPin,
  PlayCircle,
  Trophy,
  Video,
} from "lucide-react";
import { requireRole } from "@/lib/session";
import { sessionRange } from "@/lib/dates";
import { GAME_CODES } from "@/src/data/games";
import { getUserCourseWorkspace } from "@/src/services/enrollmentService";

export const metadata = { title: "Course space" };
export const dynamic = "force-dynamic";

type RouteParams = Promise<{ code: string }>;

export default async function LearnCoursePage({ params }: { params: RouteParams }) {
  const session = await requireRole("user");
  const { code } = await params;
  const course = await getUserCourseWorkspace(session.user.id, decodeURIComponent(code));

  if (!course) notFound();

  const handbookUrl = `/api/courses/${encodeURIComponent(course.course.code)}/handbook`;
  const canJoinLive = course.nextSession?.mode === "live_online" && Boolean(course.nextSession.meetingLink);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">{course.course.code}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{course.course.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              {course.course.summary || "Your learning space is ready. Use the handbook, follow the session plan, and come back here for your next step."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-brand">{course.course.vendor}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">{course.course.group}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                {course.course.durationDays} {course.course.durationDays === 1 ? "day" : "days"}
              </span>
              {course.course.modes.map((mode) => (
                <span key={mode} className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                  {mode === "live_online" ? "Live online" : mode === "on_site" ? "On-site" : "Self-paced"}
                </span>
              ))}
            </div>
          </div>

          <div className="grid min-w-[220px] gap-3 sm:grid-cols-3 sm:text-center">
            <Stat label="Progress" value={`${course.progress}%`} />
            <Stat label="Coins" value={String(course.course.coinReward)} />
            <Stat label="Status" value={course.status === "completed" ? "Done" : "Active"} />
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              icon={<BookOpen className="h-5 w-5 text-brand" />}
              title="Course handbook"
              body="Read the handbook here or download it if you want to study offline."
              action={
                <div className="flex flex-wrap gap-2">
                  <a
                    href={handbookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
                  >
                    Open handbook
                  </a>
                  <a
                    href={handbookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                </div>
              }
            />

            <Card
              icon={course.nextSession?.mode === "on_site" ? <MapPin className="h-5 w-5 text-brand" /> : <Video className="h-5 w-5 text-brand" />}
              title={course.nextSession ? "Next live step" : "Next step"}
              body={
                course.nextSession
                  ? `${course.nextSession.mode === "live_online" ? "Live online session" : "On-site session"} on ${sessionRange(course.nextSession.startsAt, course.nextSession.endsAt)}`
                  : "No live session is fixed yet. You can still use the handbook and get ready."
              }
              action={
                course.nextSession ? (
                  canJoinLive ? (
                    <a
                      href={course.nextSession?.meetingLink ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Join live class
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {course.nextSession.mode === "on_site"
                        ? course.nextSession.location || "Location will be shared soon."
                        : "The meeting link will appear here once it is ready."}
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">Keep learning with the handbook while we prepare the next session.</p>
                )
              }
            />
          </div>

          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-semibold">What you will do</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {course.lessonPlan.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 font-medium">{step.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-semibold">Course screen</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              This screen gives the learner something real to open right away: the handbook, the next session details, and the course path in one place.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-black">
              <iframe
                title={`${course.course.code} handbook`}
                src={handbookUrl}
                className="h-[520px] w-full bg-white"
              />
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Your actions</h2>
            <div className="mt-4 space-y-2">
              <a
                href={handbookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
              >
                Open handbook
              </a>
              <Link
                href={`/assessment/${encodeURIComponent(course.course.code)}`}
                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
              >
                {course.assessment.available ? "Take assessment" : "Open assessment"}
              </Link>
              {GAME_CODES.includes(course.course.code) && (
                <Link
                  href={`/game/${encodeURIComponent(course.course.code)}`}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-brand/40 bg-brand/5 px-4 text-sm font-semibold text-brand hover:bg-brand/10"
                >
                  <Trophy className="h-4 w-4" />
                  Play the game
                </Link>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold">Session details</h2>
            </div>
            {course.nextSession ? (
              <div className="mt-4 space-y-3 text-sm">
                <p className="rounded-2xl bg-muted px-3 py-2 font-medium">
                  {course.nextSession.mode === "live_online" ? "Live online" : "On-site"}
                </p>
                <p>{sessionRange(course.nextSession.startsAt, course.nextSession.endsAt)}</p>
                {course.nextSession.mode === "on_site" ? (
                  <p className="text-muted-foreground">{course.nextSession.location || "Location will be shared soon."}</p>
                ) : course.nextSession.meetingLink ? (
                  <a
                    href={course.nextSession.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
                  >
                    Open live room
                  </a>
                ) : (
                  <p className="text-muted-foreground">The meeting link will appear here when it is ready.</p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No session date is fixed yet.</p>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold">Assessment</h2>
            </div>
            {course.assessment.available ? (
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-fg">{course.assessment.title}</p>
                <p>{course.assessment.questionCount} questions</p>
                <p>Pass mark: {course.assessment.passThreshold}%</p>
                <p>Time: {course.assessment.timeLimitMinutes} minutes</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                This course page is ready now. The assessment screen will open with a friendly message until questions are published.
              </p>
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function Card({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <div className="mt-4">{action}</div>
    </section>
  );
}
