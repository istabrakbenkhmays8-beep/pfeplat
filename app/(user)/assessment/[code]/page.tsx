import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import { loadQuizForCourse } from "@/src/services/assessmentService";
import { QuizRunner } from "./QuizRunner";

export const metadata = { title: "Assessment" };
export const dynamic = "force-dynamic";

type RouteParams = Promise<{ code: string }>;

export default async function AssessmentPage({ params }: { params: RouteParams }) {
  await requireRole("user");
  const { code } = await params;
  const quiz = await loadQuizForCourse(decodeURIComponent(code));
  if (!quiz) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-xs font-medium text-muted-foreground">
          Assessment · {quiz.course.code}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{quiz.course.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {quiz.questions.length} questions · {quiz.timeLimitMinutes} minutes · pass at {quiz.passThreshold}%
        </p>
      </header>

      {quiz.questions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No questions yet. Try again later.</p>
          <Link
            href={`/catalog/${encodeURIComponent(quiz.course.code)}`}
            className="mt-4 inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 text-sm hover:bg-muted"
          >
            Back to course
          </Link>
        </div>
      ) : (
        <QuizRunner quiz={quiz} />
      )}
    </div>
  );
}
