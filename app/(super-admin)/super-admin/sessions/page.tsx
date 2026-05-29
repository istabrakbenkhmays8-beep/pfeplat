import { connectDb } from "@/lib/db";
import { Session, Trainer } from "@/src/models";
import { sessionRange } from "@/lib/dates";
import { TrainerAssignCell } from "./TrainerAssignCell";

export const metadata = { title: "Sessions" };
export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  await connectDb();
  const [sessions, trainers] = await Promise.all([
    Session.find({})
      .populate({ path: "course", select: "code title" })
      .populate({ path: "trainer", select: "firstName surname email" })
      .sort({ startsAt: 1 })
      .lean<any[]>(),
    Trainer.find({ isActive: true })
      .select("firstName surname email specialty")
      .sort({ surname: 1 })
      .lean<any[]>(),
  ]);

  const trainerOptions = trainers.map((t) => ({
    id: String(t._id),
    label: `${t.firstName} ${t.surname}${t.specialty ? ` — ${t.specialty}` : ""}`,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
        <p className="text-sm text-muted-foreground">
          {sessions.length} sessions on record. Pick a trainer to send them an automatic assignment email.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">When</th>
              <th className="px-4 py-3 text-start">Course</th>
              <th className="px-4 py-3 text-start">Mode</th>
              <th className="px-4 py-3 text-start">Trainer</th>
              <th className="px-4 py-3 text-end">Enrolled</th>
              <th className="px-4 py-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sessions.map((s) => (
              <tr key={String(s._id)} className="hover:bg-muted/40">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                  {sessionRange(new Date(s.startsAt).toISOString(), new Date(s.endsAt).toISOString())}
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-muted-foreground">{s.course?.code}</p>
                  <p className="font-medium">{s.course?.title ?? "—"}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {s.mode === "live_online" ? "Live online" : "On-site"}
                </td>
                <td className="px-4 py-3">
                  <TrainerAssignCell
                    sessionId={String(s._id)}
                    currentTrainerId={s.trainer ? String(s.trainer._id) : null}
                    currentTrainerName={
                      s.trainer ? `${s.trainer.firstName} ${s.trainer.surname}` : null
                    }
                    options={trainerOptions}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-end">
                  {s.enrolledCount ?? 0} / {s.capacity ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No sessions scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
