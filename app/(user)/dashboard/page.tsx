import Link from "next/link";
import { Types } from "mongoose";
import { getSession } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { Enrollment, User } from "@/src/models";
import { listUserEnrollments } from "@/src/services/enrollmentService";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const session = await getSession();
  if (!session) return null;
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  await connectDb();
  const uid = new Types.ObjectId(session.user.id);
  const [user, inProgress, completedCount, recent] = await Promise.all([
    User.findById(uid).select("walletCoins").lean(),
    Enrollment.countDocuments({ user: uid, status: "active" }),
    Enrollment.countDocuments({ user: uid, status: "completed" }),
    listUserEnrollments(session.user.id).then((rows) => rows.slice(0, 3)),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {firstName}.</h1>
        <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Courses in progress", value: String(inProgress), href: "/my-courses" },
          { label: "Coins earned", value: String(user?.walletCoins ?? 0), href: "/wallet" },
          { label: "Certificates", value: String(completedCount), href: "/certificates" },
        ].map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="mt-2 text-3xl font-bold">{k.value}</p>
          </Link>
        ))}
      </div>

      {recent.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t enrolled in any course yet.
          </p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Continue learning</h2>
            <Link href="/my-courses" className="text-sm font-medium text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((r) => (
              <Link
                key={r.enrollmentId}
                href={`/catalog/${encodeURIComponent(r.course.code)}`}
                className="rounded-xl border border-border bg-card p-4 transition hover:border-brand/50 hover:shadow-sm"
              >
                <p className="font-mono text-xs text-muted-foreground">{r.course.code}</p>
                <p className="mt-1 line-clamp-2 font-medium">{r.course.title}</p>
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-brand" style={{ width: `${r.progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.progress}% complete</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
