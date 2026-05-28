"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CreditCard, Loader2 } from "lucide-react";

const COIN_VALUE_TND = 0.1;

export function CheckoutForm({
  courseCode,
  priceTnd,
  walletCoins,
  maxCoinsUsable,
}: {
  courseCode: string;
  priceTnd: number;
  walletCoins: number;
  maxCoinsUsable: number;
}) {
  const router = useRouter();
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [cardLast4, setCardLast4] = useState("4242");
  const [busy, setBusy] = useState(false);

  const totals = useMemo(() => {
    const safe = Math.max(0, Math.min(coinsToUse, maxCoinsUsable));
    const discount = Math.round(safe * COIN_VALUE_TND * 100) / 100;
    const tndDue = Math.max(0, priceTnd - discount);
    return { coinsUsed: safe, discount, tndDue };
  }, [coinsToUse, maxCoinsUsable, priceTnd]);

  async function pay() {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseCode, coinsToUse: totals.coinsUsed, cardLast4 }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Payment failed");
        return;
      }
      toast.success(`Paid ${data.tndCharged} DT — you're enrolled`);
      router.push("/my-courses");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        pay();
      }}
      className="space-y-4 rounded-xl border border-border bg-card p-6"
    >
      <div>
        <div className="flex items-center justify-between text-sm">
          <label htmlFor="coins" className="font-medium">Apply coins (1 coin = 0.10 DT off)</label>
          <span className="font-semibold text-brand">−{totals.discount} DT</span>
        </div>
        <input
          id="coins"
          type="range"
          min={0}
          max={maxCoinsUsable}
          value={coinsToUse}
          onChange={(e) => setCoinsToUse(Number(e.target.value))}
          disabled={maxCoinsUsable === 0}
          className="mt-2 w-full accent-[var(--color-brand)]"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>
            Using <strong className="text-fg">{totals.coinsUsed}</strong> of {walletCoins} coins
          </span>
          <span>{maxCoinsUsable}</span>
        </div>
      </div>

      <div>
        <label htmlFor="card" className="text-sm font-medium">Card number (last 4 — mock)</label>
        <div className="relative mt-1">
          <CreditCard aria-hidden className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="card"
            inputMode="numeric"
            maxLength={4}
            pattern="\d{4}"
            value={cardLast4}
            onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="h-10 w-full rounded-md border border-border bg-surface ps-9 pe-3 text-sm font-mono focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Mock gateway — any 4 digits work. Real cards land here once Paymee / Konnect / Flouci is wired.
        </p>
      </div>

      <hr className="border-border" />

      <div className="flex items-center justify-between text-lg font-bold">
        <span>Total due today</span>
        <span>{totals.tndDue.toLocaleString("en-GB")} DT</span>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Pay {totals.tndDue} DT &amp; enroll
      </button>
    </form>
  );
}
