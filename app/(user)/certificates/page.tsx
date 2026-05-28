import Link from "next/link";
import { Types } from "mongoose";
import { requireRole } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { Enrollment } from "@/src/models";

export const metadata = { title: "Certificates" };
export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const session = await requireRole("user");
  await connectDb();
  const completed = await Enrollment.find({
    user: new Types.ObjectId(session.user.id),
    status: "completed",
  })
    .populate({ path: "course", populate: { path: "category" } })
    .sort({ completedAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
        <p className="text-sm text-muted-foreground">
          Your earned certificates of completion. Share them or download a PDF.
        </p>
      </header>

      {completed.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-lg font-semibold">No certificates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete a course to unlock your first certificate.
          </p>
          <Link
            href="/my-courses"
            className="mt-4 inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
          >
            Go to my courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {completed.map((e: any) => (
            <div
              key={String(e._id)}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-[3/2] bg-gradient-to-br from-brand to-brand-700 p-6 text-brand-foreground">
                <p className="text-xs uppercase tracking-widest opacity-90">Certificate of completion</p>
                <p className="mt-2 text-lg font-bold leading-tight">{e.course?.title}</p>
                <p className="mt-1 font-mono text-xs opacity-80">{e.course?.code}</p>
                <p className="absolute bottom-6 start-6 text-xs opacity-80">
                  Issued{" "}
                  {e.completedAt
                    ? new Date(e.completedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
                <p className="absolute bottom-6 end-6 text-xs font-semibold uppercase">Advancia</p>
              </div>
              <div className="flex items-center justify-between p-4 text-sm">
                <span className="text-muted-foreground">
                  {session.user.name}
                </span>
                <span className="text-xs text-muted-foreground">PDF coming soon</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
