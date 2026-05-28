import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/session";
import { BuyCoinsForm } from "./BuyCoinsForm";

export const metadata = { title: "Buy coins" };
export const dynamic = "force-dynamic";

/**
 * Coin shop — three packs at clear round prices, paid with a credit card.
 * Pack TND → coin ratios are intentionally generous (better than the 0.10 DT redeem
 * rate) so buying coins is always cheaper than buying coin-equivalents straight up,
 * which gives users a reason to top up rather than always paying cash.
 */
export const COIN_PACKS = [
  { id: "starter", coins: 500, tnd: 40, bonusLabel: null as string | null },
  { id: "boost", coins: 1500, tnd: 100, bonusLabel: "Save 17%" },
  { id: "pro", coins: 4000, tnd: 240, bonusLabel: "Save 25% · best value" },
] as const;

export default async function BuyCoinsPage() {
  await requireRole("user");
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/wallet"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to wallet
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Buy coins</h1>
        <p className="text-sm text-muted-foreground">
          Top up your wallet so you can pay for courses with coins. Pick a pack, then check out with a card.
        </p>
      </div>

      <BuyCoinsForm packs={COIN_PACKS.map((p) => ({ ...p }))} />

      <p className="text-xs text-muted-foreground">
        A receipt lands in your inbox the moment payment succeeds. Coins are credited instantly to your wallet.
      </p>
    </div>
  );
}
