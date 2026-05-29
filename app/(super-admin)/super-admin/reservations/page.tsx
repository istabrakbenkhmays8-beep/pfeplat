import Link from "next/link";
import { listReservations } from "@/src/services/reservationService";
import { RESERVATION_STATUSES } from "@/src/models";
import { sessionRange } from "@/lib/dates";
import { ReservationActions } from "./ReservationActions";

export const metadata = { title: "Reservations" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

export default async function ReservationsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const status = sp.status && (RESERVATION_STATUSES as readonly string[]).includes(sp.status)
    ? sp.status
    : "pending";
  const rows = await listReservations(status);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
        <p className="text-sm text-muted-foreground">
          Approve or reject session reservations. Approving locks the seat and triggers a trainer email (when SMTP is configured).
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "cancelled", "attended", "no_show", "all"].map((s) => (
          <Link
            key={s}
            href={`/super-admin/reservations${s === "all" ? "" : `?status=${s}`}`}
            className={
              status === s || (s === "all" && !sp.status)
                ? "inline-flex h-8 items-center rounded-full bg-brand px-3 text-xs font-medium text-brand-foreground"
                : "inline-flex h-8 items-center rounded-full border border-border bg-surface px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-fg"
            }
          >
            {s}
          </Link>
        ))}
      </nav>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">Learner</th>
              <th className="px-4 py-3 text-start">Course</th>
              <th className="px-4 py-3 text-start">Session</th>
              <th className="px-4 py-3 text-start">Requested</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-end">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.user?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{r.user?.email ?? ""}</p>
                </td>
                <td className="px-4 py-3">
                  {r.course ? (
                    <Link
                      href={`/catalog/${encodeURIComponent(r.course.code)}`}
                      className="font-medium hover:text-brand"
                    >
                      <span className="font-mono text-xs text-muted-foreground">{r.course.code}</span>{" "}
                      {r.course.title}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {r.session ? sessionRange(r.session.startsAt, r.session.endsAt) : "—"}
                  {r.session?.location && <p className="mt-1 text-[10px]">{r.session.location}</p>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusChip status={r.status} />
                  {r.reviewNote && (
                    <p className="mt-1 max-w-xs truncate text-[10px] text-muted-foreground" title={r.reviewNote}>
                      {r.reviewNote}
                    </p>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-end">
                  {r.status === "pending" ? (
                    <ReservationActions reservationId={r.id} />
                  ) : (
                    <span className="text-xs text-muted-foreground">Reviewed</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No reservations to show.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-warning/10 text-warning border-warning/30",
    approved: "bg-success/10 text-success border-success/30",
    rejected: "bg-danger/10 text-danger border-danger/30",
    cancelled: "bg-muted text-muted-foreground border-border",
    attended: "bg-brand/10 text-brand border-brand/30",
    no_show: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}
