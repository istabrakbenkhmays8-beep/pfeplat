"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, CreditCard, Loader2, Lock, Sparkles } from "lucide-react";
import { AdvanciaCard, AdvanciaCoin } from "@/components/ui/PaymentArt";
import { cn } from "@/lib/cn";

type Pack = { id: string; coins: number; tnd: number; bonusLabel: string | null };

export function BuyCoinsForm({ packs }: { packs: Pack[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(packs[1]?.id ?? packs[0].id);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/29");
  const [cardCvv, setCardCvv] = useState("123");
  const [busy, setBusy] = useState(false);

  const selected = packs.find((p) => p.id === selectedId)!;
  const last4 = cardNumber.replace(/\D/g, "").slice(-4).padStart(4, "•");

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/wallet/buy-coins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          packId: selectedId,
          cardLast4: cardNumber.replace(/\D/g, "").slice(-4).padStart(4, "0"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Payment failed");
        return;
      }
      toast.success(`${data.coinsCredited} coins added — new balance ${data.newBalance}.`);
      router.push("/wallet");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={pay} className="space-y-6">
      {/* Pack picker */}
      <div className="grid gap-3 sm:grid-cols-3">
        {packs.map((p) => {
          const isOn = p.id === selectedId;
          const ratio = (p.coins / p.tnd).toFixed(1);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={cn(
                "group relative flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-start transition",
                isOn ? "border-brand bg-brand/5" : "border-border bg-card hover:border-brand/40",
              )}
            >
              {p.bonusLabel && (
                <span className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-foreground shadow">
                  <Sparkles className="h-3 w-3" />
                  {p.bonusLabel}
                </span>
              )}
              {isOn && (
                <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-brand-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <div className="inline-flex items-center gap-1.5">
                <AdvanciaCoin size={22} ariaLabel="" />
                <span className="text-2xl font-bold">{p.coins.toLocaleString("en-GB")}</span>
              </div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">coins</p>
              <div className="mt-auto">
                <p className="text-xl font-bold">{p.tnd} DT</p>
                <p className="text-[11px] text-muted-foreground">{ratio} coins per DT</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Card form */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mx-auto max-w-sm">
          <AdvanciaCard last4={last4} />
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="holder" className="text-sm font-medium">
              Cardholder name
            </label>
            <input
              id="holder"
              autoComplete="cc-name"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="As shown on the card"
              className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label htmlFor="card" className="text-sm font-medium">
              Card number
            </label>
            <div className="relative mt-1">
              <CreditCard
                aria-hidden
                className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <input
                id="card"
                inputMode="numeric"
                autoComplete="cc-number"
                value={cardNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
                }}
                className="h-10 w-full rounded-md border border-border bg-surface ps-9 pe-3 font-mono text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="exp" className="text-sm font-medium">
                Expiry (MM/YY)
              </label>
              <input
                id="exp"
                inputMode="numeric"
                autoComplete="cc-exp"
                maxLength={5}
                value={cardExpiry}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setCardExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                }}
                className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 font-mono text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label htmlFor="cvv" className="text-sm font-medium">
                CVV
              </label>
              <input
                id="cvv"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 font-mono text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Order line */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
        <div>
          <p className="text-sm text-muted-foreground">You&rsquo;re buying</p>
          <p className="font-bold">{selected.coins.toLocaleString("en-GB")} coins</p>
        </div>
        <div className="text-end">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{selected.tnd} DT</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        Pay {selected.tnd} DT and add {selected.coins.toLocaleString("en-GB")} coins
      </button>
    </form>
  );
}
