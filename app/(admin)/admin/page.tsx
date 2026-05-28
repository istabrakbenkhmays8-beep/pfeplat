import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Course, Enrollment, Session, User } from "@/src/models";

export const metadata = { title: "Admin overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await connectDb();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [activeLearners, coursesCount, sessionsThisMonth, completionsThisMonth, totalEnrollments] =
    await Promise.all([
      User.countDocuments({ role: "user", status: "active" }),
      Course.countDocuments({ isPublished: true }),
      Session.countDocuments({ startsAt: { $gte: startOfMonth } }),
      Enrollment.countDocuments({ status: "completed", completedAt: { $gte: startOfMonth } }),
      Enrollment.countDocuments({}),
    ]);

  const completionRate =
    totalEnrollments === 0
      ? 0
      : Math.round(
          ((await Enrollment.countDocuments({ status: "completed" })) / totalEnrollments) * 100,
        );

  const recentUsers = await User.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select("firstName surname email role createdAt")
    .lean<any[]>();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Admin overview</h1>
        <p className="text-sm text-muted-foreground">A quick look at how the platform is doing.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Active learners" value={activeLearners} hint="Status: active" />
        <Kpi label="Published courses" value={coursesCount} hint="In the catalog" />
        <Kpi label="Sessions this month" value={sessionsThisMonth} hint="Live + on-site" />
        <Kpi label="Completion rate" value={`${completionRate}%`} hint="All time" />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent sign-ups</h2>
            <Link href="/admin/users" className="text-xs font-medium text-brand hover:underline">
              See all →
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentUsers.map((u) => (
                <li key={String(u._id)} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {u.firstName} {u.surname}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="ms-3 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold">Course completions this month</h2>
          <p className="text-4xl font-bold tracking-tight">{completionsThisMonth}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalEnrollments} total enrollments across all time.
          </p>
          <Link
            href="/admin/courses"
            className="mt-4 inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
          >
            Manage courses →
          </Link>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
