import Link from "next/link";
import { Pencil } from "lucide-react";
import { connectDb } from "@/lib/db";
import { Course } from "@/src/models";
import { VendorBadge } from "@/components/ui/VendorBadge";
import type { Vendor } from "@/src/data/seed";

export const metadata = { title: "Manage courses" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string }>;

export default async function AdminCoursesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  await connectDb();

  const filter: Record<string, unknown> = {};
  if (q && q.trim()) {
    const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { code: rx }];
  }
  const courses = await Course.find(filter)
    .populate("category")
    .sort({ code: 1 })
    .lean<any[]>();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage courses</h1>
          <p className="text-sm text-muted-foreground">{courses.length} courses in the catalog.</p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground opacity-60"
        >
          + Add course (soon)
        </button>
      </header>

      <form action="/admin/courses" method="get" className="max-w-md">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title or code…"
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">Code</th>
              <th className="px-4 py-3 text-start">Title</th>
              <th className="px-4 py-3 text-start">Partner</th>
              <th className="px-4 py-3 text-start">Domain</th>
              <th className="px-4 py-3 text-end">Duration</th>
              <th className="px-4 py-3 text-end">Price</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.map((c) => (
              <tr key={String(c._id)} className="hover:bg-muted/40">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold">
                  {c.code}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/catalog/${encodeURIComponent(c.code)}`}
                    className="font-medium hover:text-brand"
                  >
                    {c.title}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {c.category?.vendor && <VendorBadge vendor={c.category.vendor as Vendor} />}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {c.category?.group}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-end text-muted-foreground">
                  {c.durationDays}J
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-end font-medium">
                  {(c.priceTnd ?? 0).toLocaleString("en-GB")} DT
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {c.isPublished ? (
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Draft
                    </span>
                  )}
                  {c.isFeatured && (
                    <span className="ms-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                      Featured
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    disabled
                    aria-label="Edit"
                    title="Edit (coming soon)"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-50 hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No courses match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
