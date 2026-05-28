import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getCheckoutPreview } from "@/src/services/paymentService";
import { CheckoutForm } from "./CheckoutForm";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ course?: string }>;

export default async function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireRole("user");
  const sp = await searchParams;
  if (!sp.course) redirect("/catalog");

  const preview = await getCheckoutPreview(session.user.id, sp.course);
  if (!preview) redirect("/catalog");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;re about to enroll in <strong className="text-fg">{preview.course.title}</strong>.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Course price</span>
          <span className="text-2xl font-bold">{preview.course.priceTnd.toLocaleString("en-GB")} DT</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Your wallet</span>
          <span className="font-semibold text-brand">{preview.user.walletCoins} coins</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Reward on completion</span>
          <span>+{preview.course.coinReward} coins</span>
        </div>
      </div>

      <CheckoutForm
        courseCode={preview.course.code}
        priceTnd={preview.course.priceTnd}
        walletCoins={preview.user.walletCoins}
        maxCoinsUsable={preview.maxCoinsUsable}
      />

      <p className="text-xs text-muted-foreground">
        Payments run through a mock gateway in dev (`MOCK-…` reference). Real adapters (Paymee, Konnect, Flouci) plug into the same{" "}
        <code className="rounded bg-muted px-1">PaymentService</code>.
      </p>

      <p className="text-sm">
        Changed your mind?{" "}
        <Link href={`/catalog/${encodeURIComponent(preview.course.code)}`} className="font-medium text-brand hover:underline">
          Back to the course
        </Link>
      </p>
    </div>
  );
}
