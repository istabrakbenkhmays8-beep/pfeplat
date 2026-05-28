export const metadata = { title: "Admin overview" };

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Admin overview</h1>
        <p className="text-sm text-muted-foreground">A quick look at how the platform is doing.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active learners", value: "0" },
          { label: "Courses this month", value: "0" },
          { label: "Completion rate", value: "—" },
          { label: "Revenue (this month)", value: "0 DT" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="mt-2 text-3xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Charts and tables will appear here.</p>
      </div>
    </div>
  );
}
