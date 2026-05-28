/**
 * Admin trainers page — same UI as the super-admin one, just rooted under
 * /admin so regular admins can manage trainers too. The underlying API
 * (`/api/super-admin/trainers`) was relaxed to accept both admin and
 * super_admin (see app/api/super-admin/trainers/route.ts).
 *
 * We deliberately reuse the existing `AddTrainer` + `TrainerRow` client
 * components rather than duplicating them — the route under /super-admin
 * remains a sibling page sharing the same widgets.
 */
import { listTrainers } from "@/src/services/trainerService";
import { AddTrainer } from "@/app/(super-admin)/super-admin/trainers/AddTrainer";
import { TrainerRow } from "@/app/(super-admin)/super-admin/trainers/TrainerRow";

export const metadata = { title: "Trainers" };
export const dynamic = "force-dynamic";

export default async function AdminTrainersPage() {
  const trainers = await listTrainers();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trainers</h1>
          <p className="text-sm text-muted-foreground">
            {trainers.length} {trainers.length === 1 ? "trainer" : "trainers"} on record. Trainers
            don&apos;t log in — they receive assignment emails.
          </p>
        </div>
        <AddTrainer />
      </header>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">Name</th>
              <th className="px-4 py-3 text-start">Email</th>
              <th className="px-4 py-3 text-start">Specialty</th>
              <th className="px-4 py-3 text-start">Country</th>
              <th className="px-4 py-3 text-start">Active</th>
              <th className="px-4 py-3 text-end"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trainers.map((t) => (
              <TrainerRow
                key={String(t._id)}
                trainer={{
                  id: String(t._id),
                  firstName: t.firstName,
                  surname: t.surname,
                  email: t.email,
                  specialty: t.specialty ?? "",
                  country: t.country ?? "",
                  isActive: t.isActive ?? true,
                }}
              />
            ))}
            {trainers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No trainers yet. Click <strong className="text-fg">+ Add trainer</strong> to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
