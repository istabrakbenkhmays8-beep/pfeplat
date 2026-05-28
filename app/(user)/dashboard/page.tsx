import { getSession } from "@/lib/session";

export const metadata = { title: "Dashboard" };

export default async function UserDashboardPage() {
  const session = await getSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {firstName}.</h1>
        <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Courses in progress", value: "0" },
          { label: "Coins earned", value: String(session?.user?.walletCoins ?? 0) },
          { label: "Certificates", value: "0" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="mt-2 text-3xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Your courses will appear here.</p>
      </div>
    </div>
  );
}
