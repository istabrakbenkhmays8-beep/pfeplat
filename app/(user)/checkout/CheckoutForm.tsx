"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CreditCard, Loader2, Coins, ChevronLeft, Lock, Check } from "lucide-react";
import { AdvanciaCard, AdvanciaCoin } from "@/components/ui/PaymentArt";
import { cn } from "@/lib/cn";

/** Server-mirrored — 1 coin = 0.10 DT. Authoritative value lives in paymentService.ts. */
const COIN_VALUE_TND = 0.1;

type Method = "card" | "coins";

export function CheckoutForm({
  courseCode,
  priceTnd,
  walletCoins,
  maxCoinsUsable: _maxCoinsUsable,
}: {
  courseCode: string;
  priceTnd: number;
  walletCoins: number;
  /** Max coins the server will accept (≤ wallet AND ≤ price). Kept for API
   *  compatibility with /api/checkout/preview; currently we recompute it
   *  locally from priceTnd, but we may switch to the server value. */
  maxCoinsUsable: number;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<Method | null>(null);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/29");
  const [cardCvv, setCardCvv] = useState("123");
  const [busy, setBusy] = useState(false);

  // Coins needed to cover the FULL price (coins-only mode).
  const coinsNeeded = Math.ceil(priceTnd / COIN_VALUE_TND);
  const canPayWithCoins = walletCoins >= coinsNeeded && coinsNeeded > 0;

  // Free course (priceTnd === 0) — no real payment needed, just enroll. Pre-pick card mode silently
  // and skip method selection so the flow stays one click.
  if (priceTnd === 0) {
    return <FreeEnrollButton courseCode={courseCode} />;
  }

  async function pay(opts: { coinsToUse: number; cardLast4: string }) {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseCode, ...opts }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Payment failed");
        return;
      }
      const summary =
        opts.coinsToUse > 0
          ? `Paid with ${opts.coinsToUse} coins — you're enrolled.`
          : `Paid ${data.tndCharged} DT — you're enrolled.`;
      toast.success(summary);
      router.push("/my-courses");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  // Step 1 — pick a method.
  if (method === null) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold">How would you like to pay?</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <MethodCard
            selected={false}
            onClick={() => setMethod("card")}
            icon={<CreditCard className="h-6 w-6" />}
            title="Credit card"
            subtitle={`${priceTnd.toLocaleString("en-GB")} DT charged to your card`}
            badges={["Visa", "Mastercard", "Secure"]}
            available
          />
          <MethodCard
            selected={false}
            onClick={() => canPayWithCoins && setMethod("coins")}
            icon={<AdvanciaCoin size={24} ariaLabel="" />}
            title="Pay with coins"
            subtitle={
              canPayWithCoins
                ? `${coinsNeeded} coins from your wallet (you have ${walletCoins})`
                : `Need ${coinsNeeded} coins — you have ${walletCoins}`
            }
            badges={canPayWithCoins ? ["Instant", "No card"] : ["Not enough coins"]}
            available={canPayWithCoins}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Pick one. You can use coins to pay the full price, or pay the {priceTnd} DT with a card. We&rsquo;ll
          email you a receipt either way.
        </p>
      </div>
    );
  }

  // Step 2 — fill in the chosen method's form.
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (method === "coins") {
          pay({ coinsToUse: coinsNeeded, cardLast4: "0000" });
        } else {
          const last4 = cardNumber.replace(/\D/g, "").slice(-4).padStart(4, "0");
          pay({ coinsToUse: 0, cardLast4: last4 });
        }
      }}
      className="space-y-5 rounded-xl border border-border bg-card p-6"
    >
      <button
        type="button"
        onClick={() => setMethod(null)}
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-fg"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Change payment method
      </button>

      {method === "card" ? (
        <CardForm
          cardHolder={cardHolder}
          setCardHolder={setCardHolder}
          cardNumber={cardNumber}
          setCardNumber={setCardNumber}
          cardExpiry={cardExpiry}
          setCardExpiry={setCardExpiry}
          cardCvv={cardCvv}
          setCardCvv={setCardCvv}
          priceTnd={priceTnd}
        />
      ) : (
        <CoinsForm walletCoins={walletCoins} coinsNeeded={coinsNeeded} priceTnd={priceTnd} />
      )}

      <hr className="border-border" />

      <div className="flex items-center justify-between text-lg font-bold">
        <span>Total due today</span>
        <span>{method === "coins" ? `${coinsNeeded} coins` : `${priceTnd.toLocaleString("en-GB")} DT`}</span>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {method === "coins" ? `Spend ${coinsNeeded} coins & enroll` : `Pay ${priceTnd} DT & enroll`}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Confirmation email lands in your inbox the moment payment succeeds.
      </p>
    </form>
  );
}

function MethodCard({
  selected,
  onClick,
  icon,
  title,
  subtitle,
  badges,
  available,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badges: string[];
  available: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!available}
      className={cn(
        "group flex h-full flex-col items-start gap-3 rounded-xl border-2 p-5 text-start transition",
        selected ? "border-brand bg-brand/5" : "border-border bg-surface",
        available
          ? "hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-md"
          : "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-xl",
            available ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </span>
        {selected && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-foreground">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div>
        <h3 className="text-base font-bold">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-1">
        {badges.map((b) => (
          <span key={b} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {b}
          </span>
        ))}
      </div>
    </button>
  );
}

function CardForm({
  cardHolder,
  setCardHolder,
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvv,
  setCardCvv,
  priceTnd,
}: {
  cardHolder: string;
  setCardHolder: (v: string) => void;
  cardNumber: string;
  setCardNumber: (v: string) => void;
  cardExpiry: string;
  setCardExpiry: (v: string) => void;
  cardCvv: string;
  setCardCvv: (v: string) => void;
  priceTnd: number;
}) {
  const last4 = cardNumber.replace(/\D/g, "").slice(-4).padStart(4, "•");
  return (
    <>
      <div className="mx-auto max-w-sm">
        <AdvanciaCard last4={last4} />
      </div>

      <div>
        <label htmlFor="cardholder" className="text-sm font-medium">
          Cardholder name
        </label>
        <input
          id="cardholder"
          type="text"
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
          <CreditCard aria-hidden className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="card"
            inputMode="numeric"
            autoComplete="cc-number"
            value={cardNumber}
            onChange={(e) => {
              // Light formatting: 16 digits grouped in 4s.
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

      <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          Payment secured — mock gateway in dev
        </span>
        <span className="font-semibold text-fg">{priceTnd} DT</span>
      </div>
    </>
  );
}

function CoinsForm({
  walletCoins,
  coinsNeeded,
  priceTnd,
}: {
  walletCoins: number;
  coinsNeeded: number;
  priceTnd: number;
}) {
  const remaining = walletCoins - coinsNeeded;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand/30 bg-brand/5 p-5">
        <div className="flex items-center gap-3">
          <Coins className="h-8 w-8 text-brand" />
          <div>
            <p className="font-bold">Pay with your wallet</p>
            <p className="text-xs text-muted-foreground">
              {coinsNeeded} coins will be deducted to cover the full {priceTnd} DT.
            </p>
          </div>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Wallet balance</dt>
            <dd className="font-mono font-semibold">{walletCoins} coins</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">This purchase</dt>
            <dd className="font-mono font-semibold text-brand">−{coinsNeeded} coins</dd>
          </div>
          <hr className="border-border" />
          <div className="flex items-center justify-between">
            <dt className="font-semibold">Balance after</dt>
            <dd className="font-mono font-semibold">{remaining} coins</dd>
          </div>
        </dl>
      </div>

      <p className="text-xs text-muted-foreground">
        1 coin = 0.10 DT. You earn coins by completing courses and game challenges — paying with them costs you nothing
        out-of-pocket.
      </p>
    </div>
  );
}

function FreeEnrollButton({ courseCode }: { courseCode: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseCode, coinsToUse: 0, cardLast4: "0000" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Enrollment failed");
        return;
      }
      toast.success("You're enrolled — check your email for confirmation.");
      router.push("/my-courses");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <p className="text-sm">This course is free — no payment needed.</p>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Enroll now
      </button>
    </div>
  );
}
