import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { VendorBadge } from "@/components/ui/VendorBadge";
import { getUpcomingSessionsGroupedByWeek } from "@/src/repositories/courseRepo";
import { sessionRange } from "@/lib/dates";
import type { Vendor } from "@/src/data/seed";

export const metadata = { title: "Training calendar" };
export const dynamic = "force-dynamic";

export default async function CalendrierPage() {
  const weeks = await getUpcomingSessionsGroupedByWeek();
  const total = weeks.reduce((acc, [, items]) => acc + items.length, 0);

  return (
    <Container size="wide" className="py-10">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Training calendar</h1>
        <p className="mt-2 text-muted-foreground">
          {total} sessions scheduled for June 2026 across all our domains. Click any course to see details and reserve a seat.
        </p>
        <a
          href="/reference/planning-formation-juin-2026.pdf"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download the full June 2026 planning (PDF)
        </a>
      </header>

      <div className="mt-10 space-y-10">
        {weeks.map(([week, items]) => (
          <section key={week}>
            <h2 className="mb-4 text-lg font-semibold">{week}</h2>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-start">Dates</th>
                    <th className="px-4 py-3 text-start">Course</th>
                    <th className="hidden px-4 py-3 text-start md:table-cell">Partner</th>
                    <th className="hidden px-4 py-3 text-start lg:table-cell">Domain</th>
                    <th className="px-4 py-3 text-end">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((s: any) => {
                    const course = s.course;
                    const cat = course.category;
                    return (
                      <tr key={String(s._id)} className="transition hover:bg-muted/40">
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold">
                          {sessionRange(new Date(s.startsAt).toISOString(), new Date(s.endsAt).toISOString())}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/catalog/${encodeURIComponent(course.code)}`} className="flex flex-col">
                            <span className="font-medium text-fg hover:text-brand">{course.title}</span>
                            <span className="text-xs text-muted-foreground">{course.code}</span>
                          </Link>
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 md:table-cell">
                          <VendorBadge vendor={cat.vendor as Vendor} />
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                          {cat.group}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-end text-muted-foreground">
                          {course.durationDays}J
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
