import { requireRole } from "@/lib/session";
import { listUserCoinTransactions } from "@/src/services/enrollmentService";
import { User } from "@/src/models";
import { connectDb } from "@/lib/db";
import { Types } from "mongoose";
import { TunisianWallet, AdvanciaCoin } from "@/components/ui/PaymentArt";

export const metadata = { title: "Coins & wallet" };
export const dynamic = "force-dynamic";

const reasonLabels: Record<string, string> = {
  course_completion: "Course completion",
  assessment_pass: "Assessment passed",
  game_score: "Game reward",
  streak_bonus: "Streak bonus",
  admin_grant: "Admin grant",
  purchase_discount: "Spent on course",
  refund: "Refund",
};

export default async function WalletPage() {
  const session = await requireRole("user");
  await connectDb();
  const user = await User.findById(new Types.ObjectId(session.user.id)).select("walletCoins").lean();
  const txns = await listUserCoinTransactions(session.user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Coins & wallet</h1>
        <p className="text-sm text-muted-foreground">
          Earn coins by completing courses. Spend them on discounts.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-[1fr_minmax(260px,360px)]">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-brand to-brand-700 p-6 text-brand-foreground">
          <p className="text-sm opacity-90">Current balance</p>
          <p className="mt-1 flex items-baseline gap-2 text-5xl font-bold">
            <AdvanciaCoin size={40} ariaLabel="Coin icon" />
            {user?.walletCoins ?? 0}
          </p>
          <p className="mt-1 text-xs opacity-80">coins available · 1 coin = 0.10 DT off any course</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <TunisianWallet coins={user?.walletCoins ?? 0} />
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent activity</h2>
        {txns.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No activity yet. Complete a course to earn your first coins.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">Date</th>
                  <th className="px-4 py-3 text-start">Reason</th>
                  <th className="px-4 py-3 text-end">Amount</th>
                  <th className="px-4 py-3 text-end">Balance after</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txns.map((t: any) => (
                  <tr key={String(t._id)}>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">{reasonLabels[t.reason] ?? t.reason}</td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-end font-semibold ${
                        t.delta >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {t.delta >= 0 ? "+" : ""}{t.delta}
                        <AdvanciaCoin size={14} ariaLabel="" />
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-end text-muted-foreground">
                      {t.balanceAfter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
