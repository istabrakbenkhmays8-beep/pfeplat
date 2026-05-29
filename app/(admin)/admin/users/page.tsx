import Link from "next/link";
import { FileSpreadsheet, FileText } from "lucide-react";
import {
  isRole,
  isStatus,
  listCountries,
  listUsersForAdmin,
} from "@/src/repositories/userRepo";
import { LEARNER_LEVELS, USER_ROLES, USER_STATUSES } from "@/src/models";
import { getSession } from "@/lib/session";
import { RoleCell, StatusCell } from "@/components/admin/UserRowActions";

export const metadata = { title: "Manage users" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  role?: string;
  status?: string;
  country?: string;
  level?: string;
}>;

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const [session, countries] = await Promise.all([getSession(), listCountries()]);
  const isSuper = session?.user?.role === "super_admin";
  const meId = session?.user?.id;
  const filters = {
    q: sp.q?.trim() ?? "",
    role: isRole(sp.role) ? sp.role : ("all" as const),
    status: isStatus(sp.status) ? sp.status : ("all" as const),
    country: sp.country && countries.includes(sp.country) ? sp.country : ("all" as const),
    level: sp.level && (LEARNER_LEVELS as readonly string[]).includes(sp.level) ? sp.level : ("all" as const),
  };
  const users = await listUsersForAdmin(filters);

  const qs = new URLSearchParams();
  if (filters.q) qs.set("q", filters.q);
  if (filters.role !== "all") qs.set("role", filters.role);
  if (filters.status !== "all") qs.set("status", filters.status);
  if (filters.country !== "all") qs.set("country", filters.country);
  if (filters.level !== "all") qs.set("level", filters.level);
  const exportXlsx = `/api/admin/users/export?format=xlsx&${qs.toString()}`;
  const exportPdf = `/api/admin/users/export?format=pdf&${qs.toString()}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage users</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? "user" : "users"} match these filters.
            {users.length >= 500 && " (showing first 500)"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={exportXlsx}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
          >
            <FileSpreadsheet className="h-4 w-4 text-success" />
            Export Excel
          </a>
          <a
            href={exportPdf}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
          >
            <FileText className="h-4 w-4 text-danger" />
            Export PDF
          </a>
        </div>
      </header>

      <form action="/admin/users" method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          name="q"
          defaultValue={filters.q}
          placeholder="Search name or email"
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <select
          name="role"
          defaultValue={filters.role}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
        >
          <option value="all">All roles</option>
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={filters.status}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
        >
          <option value="all">All statuses</option>
          {USER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="country"
          defaultValue={filters.country}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
        >
          <option value="all">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select
            name="level"
            defaultValue={filters.level}
            className="h-10 flex-1 rounded-md border border-border bg-surface px-3 text-sm"
          >
            <option value="all">All levels</option>
            {LEARNER_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
          >
            Apply
          </button>
        </div>
      </form>

      {(filters.q || filters.role !== "all" || filters.status !== "all" || filters.country !== "all" || filters.level !== "all") && (
        <div>
          <Link href="/admin/users" className="text-xs font-medium text-brand hover:underline">
            Clear all filters
          </Link>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">First name</th>
              <th className="px-4 py-3 text-start">Surname</th>
              <th className="px-4 py-3 text-start">Email</th>
              <th className="px-4 py-3 text-start">Gender</th>
              <th className="px-4 py-3 text-end">Age</th>
              <th className="px-4 py-3 text-start">Country</th>
              <th className="px-4 py-3 text-start">Level</th>
              <th className="px-4 py-3 text-end">Courses joined</th>
              <th className="px-4 py-3 text-end">Coins</th>
              <th className="px-4 py-3 text-start">Role</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Registered on</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/40">
                <td className="whitespace-nowrap px-4 py-3 font-medium">{u.firstName}</td>
                <td className="whitespace-nowrap px-4 py-3">{u.surname}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{u.gender}</td>
                <td className="whitespace-nowrap px-4 py-3 text-end text-muted-foreground">
                  {u.age ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{u.country || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3">{u.level}</td>
                <td className="whitespace-nowrap px-4 py-3 text-end">{u.coursesJoined}</td>
                <td className="whitespace-nowrap px-4 py-3 text-end font-semibold text-brand">
                  {u.walletCoins}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <RoleCell userId={u.id} role={u.role} canChange={isSuper && u.id !== meId} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusCell userId={u.id} status={u.status} canChange={u.id !== meId} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {new Date(u.registeredOn).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No users match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
