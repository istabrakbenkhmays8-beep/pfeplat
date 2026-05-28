import { listAdmins } from "@/src/services/adminService";
import { AddAdmin } from "./AddAdmin";
import { AdminRow } from "./AdminRow";

export const metadata = { title: "Admins" };
export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const admins = await listAdmins();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admins</h1>
          <p className="text-sm text-muted-foreground">
            {admins.length} {admins.length === 1 ? "admin" : "admins"} on the platform. Admins can manage
            users, trainers, and courses — but not other admins.
          </p>
        </div>
        <AddAdmin />
      </header>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">Name</th>
              <th className="px-4 py-3 text-start">Email</th>
              <th className="px-4 py-3 text-start">Country</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Created</th>
              <th className="px-4 py-3 text-end"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.map((a) => (
              <AdminRow key={a.id} admin={a} />
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No admins yet. Click <strong className="text-fg">+ Add admin</strong> to create one,
                  or promote an existing user via the same dialog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
