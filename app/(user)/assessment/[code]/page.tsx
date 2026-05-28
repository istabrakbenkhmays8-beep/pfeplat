import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { FileQuestion, Timer, Trophy } from "lucide-react";
import { requireRole } from "@/lib/session";
import { loadQuizForCourse } from "@/src/services/assessmentService";
import { getUserCourseWorkspace } from "@/src/services/enrollmentService";
import { QuizRunner } from "./QuizRunner";

export const metadata = { title: "Assessment" };
export const dynamic = "force-dynamic";

type RouteParams = Promise<{ code: string }>;

export default async function AssessmentPage({ params }: { params: RouteParams }) {
  const session = await requireRole("user");
  const { code } = await params;
  const normalizedCode = decodeURIComponent(code);

  const [course, quiz] = await Promise.all([
    getUserCourseWorkspace(session.user.id, normalizedCode),
    loadQuizForCourse(normalizedCode),
  ]);

  if (!course) notFound();

  const handbookUrl = `/api/courses/${encodeURIComponent(course.course.code)}/handbook`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
              Assessment - {course.course.code}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{course.course.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {quiz
                ? "Take the final check when you feel ready. Your score is saved automatically."
                : "The assessment area is ready. Questions will appear here as soon as they are published."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/learn/${encodeURIComponent(course.course.code)}`}
              className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
            >
              Back to course
            </Link>
            <a
              href={handbookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
            >
              Open handbook
            </a>
          </div>
        </div>
      </header>

      {quiz ? (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <InfoCard icon={<FileQuestion className="h-5 w-5 text-brand" />} label="Questions" value={String(quiz.questions.length)} />
            <InfoCard icon={<Timer className="h-5 w-5 text-brand" />} label="Time" value={`${quiz.timeLimitMinutes} min`} />
            <InfoCard icon={<Trophy className="h-5 w-5 text-brand" />} label="Pass mark" value={`${quiz.passThreshold}%`} />
          </section>

          {quiz.questions.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <p className="text-lg font-semibold">No questions yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The page is ready, but the trainer has not added the questions yet.
              </p>
              <Link
                href={`/learn/${encodeURIComponent(course.course.code)}`}
                className="mt-5 inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
              >
                Back to course
              </Link>
            </div>
          ) : (
            <QuizRunner quiz={quiz} />
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
          <h2 className="text-xl font-semibold">Assessment coming soon</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your course space is live, your handbook is ready, and your session details are available. The assessment questions will show up here when the trainer publishes them.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/learn/${encodeURIComponent(course.course.code)}`}
              className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
            >
              Back to course
            </Link>
            <a
              href={handbookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
            >
              Open handbook
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
