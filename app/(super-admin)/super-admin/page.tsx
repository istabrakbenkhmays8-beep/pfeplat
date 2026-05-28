export const metadata = { title: "Super admin overview" };

export default function SuperAdminOverviewPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Super admin overview</h1>
        <p className="text-sm text-muted-foreground">Everything that matters across the platform.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Admins", value: "0" },
          { label: "Pending reservations", value: "0" },
          { label: "Trainers assigned (next 7 days)", value: "0" },
          { label: "Audit events today", value: "0" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="mt-2 text-3xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">The AI agent and management tools will appear here.</p>
      </div>
    </div>
  );
}
