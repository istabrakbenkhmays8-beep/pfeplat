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

      {/* Order summary — one canonical place to see what you'll be charged. */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs font-semibold text-muted-foreground">{preview.course.code}</p>
            <h2 className="mt-0.5 text-base font-bold">{preview.course.title}</h2>
          </div>
          <span className="text-2xl font-bold">{preview.course.priceTnd.toLocaleString("en-GB")} DT</span>
        </div>
        <hr className="my-4 border-border" />
        <dl className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Your wallet</dt>
            <dd className="font-semibold text-brand">{preview.user.walletCoins} coins</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Reward on completion</dt>
            <dd>+{preview.course.coinReward} coins</dd>
          </div>
        </dl>
      </div>

      <CheckoutForm
        courseCode={preview.course.code}
        priceTnd={preview.course.priceTnd}
        walletCoins={preview.user.walletCoins}
        maxCoinsUsable={preview.maxCoinsUsable}
      />

      <p className="text-sm">
        Changed your mind?{" "}
        <Link href={`/catalog/${encodeURIComponent(preview.course.code)}`} className="font-medium text-brand hover:underline">
          Back to the course
        </Link>
      </p>
    </div>
  );
}
