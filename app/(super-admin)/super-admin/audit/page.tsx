import { connectDb } from "@/lib/db";
import { AUDIT_ACTIONS, AuditLog } from "@/src/models";

export const metadata = { title: "Audit log" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ action?: string; page?: string }>;

const PAGE_SIZE = 50;

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const action = sp.action && (AUDIT_ACTIONS as readonly string[]).includes(sp.action) ? sp.action : "all";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  await connectDb();
  const filter: Record<string, unknown> = {};
  if (action !== "all") filter.action = action;

  const [total, rows] = await Promise.all([
    AuditLog.countDocuments(filter),
    AuditLog.find(filter)
      .populate("actor", "firstName surname email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<any[]>(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted-foreground">
          {total.toLocaleString()} {total === 1 ? "event" : "events"} logged. Newest first.
        </p>
      </header>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <select
          name="action"
          defaultValue={action}
          className="h-9 rounded-md border border-border bg-surface px-3 text-sm"
        >
          <option value="all">All actions</option>
          {AUDIT_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-medium text-brand-foreground hover:bg-brand-600"
        >
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">Time</th>
              <th className="px-4 py-3 text-start">Actor</th>
              <th className="px-4 py-3 text-start">Action</th>
              <th className="px-4 py-3 text-start">Target</th>
              <th className="px-4 py-3 text-start">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={String(r._id)} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {r.actor ? (
                    <>
                      <p className="text-sm font-medium">
                        {r.actor.firstName} {r.actor.surname}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.actorRole ?? r.actor.role}</p>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">system</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-xs font-medium text-brand">
                    {r.action}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {r.targetType ?? "—"} {r.targetId && <span className="font-mono">{String(r.targetId).slice(-6)}</span>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {r.metadata?.note ?? ""}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No events match this filter yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} actionFilter={action} />
      )}
    </div>
  );
}

function Pagination({ page, totalPages, actionFilter }: { page: number; totalPages: number; actionFilter: string }) {
  const qp = (p: number) => {
    const q = new URLSearchParams();
    if (actionFilter !== "all") q.set("action", actionFilter);
    q.set("page", String(p));
    return `/super-admin/audit?${q}`;
  };
  return (
    <nav className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        {page > 1 && (
          <a href={qp(page - 1)} className="inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 hover:bg-muted">
            ← Previous
          </a>
        )}
        {page < totalPages && (
          <a href={qp(page + 1)} className="inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 hover:bg-muted">
            Next →
          </a>
        )}
      </div>
    </nav>
  );
}
