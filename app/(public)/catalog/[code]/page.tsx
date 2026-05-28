import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { VendorBadge } from "@/components/ui/VendorBadge";
import { CourseCard } from "@/components/cards/CourseCard";
import {
  getAllCourses,
  getCourse,
  searchCourses,
  sessionRange,
} from "@/src/data/queries";

type RouteParams = Promise<{ code: string }>;

export async function generateStaticParams() {
  return getAllCourses().map((c) => ({ code: c.code }));
}

export async function generateMetadata({ params }: { params: RouteParams }) {
  const { code } = await params;
  const c = getCourse(code);
  if (!c) return { title: "Course not found" };
  return { title: `${c.code} · ${c.title}` };
}

export default async function CourseDetailPage({ params }: { params: RouteParams }) {
  const { code } = await params;
  const course = getCourse(code);
  if (!course) notFound();

  const related = searchCourses({ vendor: course.category.vendor })
    .filter((c) => c.code !== course.code)
    .slice(0, 4);

  const whatYoullLearn = [
    `Implement and operate ${course.category.name} solutions with confidence.`,
    `Pass the official ${course.code} certification exam.`,
    "Apply hands-on labs that mirror real production scenarios.",
    "Get personal feedback from an authorized instructor.",
  ];

  const includes = [
    { label: "Official courseware", icon: "book" },
    { label: "Hands-on labs", icon: "lab" },
    { label: "Practice exams", icon: "check" },
    { label: "Certificate of completion", icon: "trophy" },
  ];

  return (
    <>
      {/* Breadcrumb + hero */}
      <section className="border-b border-border bg-muted/20">
        <Container size="wide" className="py-10">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/catalog" className="hover:text-fg">Courses</Link></li>
              <li aria-hidden>›</li>
              <li>
                <Link
                  href={`/catalog?vendor=${encodeURIComponent(course.category.vendor)}`}
                  className="hover:text-fg"
                >
                  {course.category.vendor}
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="text-fg">{course.code}</li>
            </ol>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <VendorBadge vendor={course.category.vendor} />
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs font-medium text-muted-foreground">{course.category.group}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="font-mono text-xs font-semibold">{course.code}</span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Official {course.category.vendor} training delivered by certified instructors. {course.durationDays}-day program with hands-on labs and exam preparation.
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <li className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" width="16" height="16" className="text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {course.durationDays} {course.durationDays === 1 ? "day" : "days"}
                </li>
                <li className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" width="16" height="16" className="text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                  </svg>
                  Online or on-site
                </li>
                <li className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" width="16" height="16" className="text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                  Official certificate
                </li>
              </ul>
            </div>

            {/* Sticky enroll panel */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                {course.juneSession ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next session</p>
                    <p className="mt-1 text-2xl font-bold">
                      {sessionRange(course.juneSession.start, course.juneSession.end)}
                    </p>
                    <p className="text-sm text-muted-foreground">{course.durationDays}-day program · June 2026</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Schedule</p>
                    <p className="mt-1 text-lg font-semibold">Contact us</p>
                    <p className="text-sm text-muted-foreground">We&apos;ll arrange a session that fits your team.</p>
                  </>
                )}

                <hr className="my-5 border-border" />

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="inline-flex h-11 w-full items-center justify-center rounded-md bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand-600"
                  >
                    Enroll now
                  </button>
                  <Link
                    href="/contact"
                    className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-surface text-sm font-semibold text-fg hover:bg-muted"
                  >
                    Request a quote
                  </Link>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {includes.map((i) => (
                    <li key={i.label} className="inline-flex items-start gap-2">
                      <svg viewBox="0 0 24 24" width="16" height="16" className="mt-0.5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{i.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* What you'll learn */}
      <section className="border-b border-border">
        <Container size="wide" className="py-12">
          <h2 className="text-2xl font-bold tracking-tight">What you&apos;ll learn</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {whatYoullLearn.map((point) => (
              <li key={point} className="inline-flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                <svg viewBox="0 0 24 24" width="18" height="18" className="mt-0.5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <Container size="wide" className="py-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight">More from {course.category.vendor}</h2>
              <Link href={`/catalog?vendor=${encodeURIComponent(course.category.vendor)}`} className="text-sm font-medium text-brand hover:underline">
                See all {course.category.vendor} courses →
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((c) => (
                <CourseCard key={c.code} course={c} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
