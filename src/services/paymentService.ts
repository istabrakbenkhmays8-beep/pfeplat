import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import {
  CoinTransaction,
  Course,
  Payment,
  User,
} from "@/src/models";
import { enroll } from "./enrollmentService";
import { sendPaymentReceiptEmail } from "./emailTemplates";

/** Coins → TND discount ratio. 100 coins == 10 TND off. Fully server-side. */
const COIN_VALUE_TND = 0.1;

export function coinsToTnd(coins: number): number {
  return Math.round(coins * COIN_VALUE_TND * 100) / 100;
}

export type CheckoutPreview = {
  course: { code: string; title: string; priceTnd: number; coinReward: number };
  user: { walletCoins: number };
  maxCoinsUsable: number;
  /** What you pay in TND when applying `coinsToUse` from your wallet. */
  computeTotals: (coinsToUse: number) => { coinsUsed: number; tndDue: number; discount: number };
};

export async function getCheckoutPreview(userId: string, courseCode: string): Promise<CheckoutPreview | null> {
  await connectDb();
  const course = await Course.findOne({ code: courseCode.toUpperCase(), isPublished: true })
    .select("code title priceTnd coinReward")
    .lean<{ code: string; title: string; priceTnd: number; coinReward: number } | null>();
  if (!course) return null;
  const user = await User.findById(new Types.ObjectId(userId)).select("walletCoins").lean<{ walletCoins?: number } | null>();
  const walletCoins = user?.walletCoins ?? 0;

  const priceTnd = course.priceTnd ?? 0;
  const maxCoinsUsable = Math.min(walletCoins, Math.floor(priceTnd / COIN_VALUE_TND));

  return {
    course: { code: course.code, title: course.title, priceTnd, coinReward: course.coinReward },
    user: { walletCoins },
    maxCoinsUsable,
    computeTotals: (coinsToUse: number) => {
      const safe = Math.max(0, Math.min(coinsToUse, maxCoinsUsable));
      const discount = coinsToTnd(safe);
      const tndDue = Math.max(0, priceTnd - discount);
      return { coinsUsed: safe, tndDue, discount };
    },
  };
}

export type CheckoutResult =
  | { ok: true; paymentId: string; enrollmentId: string; coinsUsed: number; tndCharged: number }
  | { ok: false; error: "CourseNotFound" | "InsufficientCoins" };

export async function checkout(opts: {
  userId: string;
  courseCode: string;
  coinsToUse: number;
  cardLast4: string;
}): Promise<CheckoutResult> {
  await connectDb();
  const preview = await getCheckoutPreview(opts.userId, opts.courseCode);
  if (!preview) return { ok: false, error: "CourseNotFound" };

  const safeCoins = Math.max(0, Math.min(opts.coinsToUse, preview.maxCoinsUsable));
  if (safeCoins > preview.user.walletCoins) {
    return { ok: false, error: "InsufficientCoins" };
  }
  const totals = preview.computeTotals(safeCoins);

  // 1) Enroll first so the payment row links back to a real enrollment.
  const enrollResult = await enroll(opts.userId, opts.courseCode);
  if (!enrollResult.ok) return { ok: false, error: "CourseNotFound" };

  // 2) Mock-provider payment: always succeeds. Real adapters (Paymee/Konnect/Flouci) plug in here.
  const userOid = new Types.ObjectId(opts.userId);
  const providerRef = `MOCK-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const method: "card" | "wallet" | "card_plus_wallet" =
    totals.coinsUsed > 0 ? (totals.tndDue > 0 ? "card_plus_wallet" : "wallet") : "card";
  const paidAt = new Date();
  const payment = await Payment.create({
    user: userOid,
    enrollment: new Types.ObjectId(enrollResult.enrollmentId),
    provider: "mock",
    providerRef,
    method,
    amountTnd: totals.tndDue,
    coinsUsed: totals.coinsUsed,
    status: "succeeded",
    paidAt,
  });

  // 3) Debit coins if any were used.
  if (totals.coinsUsed > 0) {
    const u = await User.findById(userOid);
    if (u) {
      u.walletCoins = Math.max(0, (u.walletCoins ?? 0) - totals.coinsUsed);
      await u.save();
      await CoinTransaction.create({
        user: userOid,
        delta: -totals.coinsUsed,
        reason: "purchase_discount",
        balanceAfter: u.walletCoins,
        payment: payment._id,
        note: `Spent on ${opts.courseCode}`,
      });
    }
  }

  // 4) Payment confirmation email — fire-and-forget so SMTP issues never roll back the purchase.
  //    We re-read user + course inline so the receipt has display fields without an extra service hop.
  (async () => {
    try {
      const [u, c] = await Promise.all([
        User.findById(userOid).select("email firstName").lean<{ email: string; firstName: string } | null>(),
        Course.findOne({ code: opts.courseCode.toUpperCase() })
          .select("title code")
          .lean<{ title: string; code: string } | null>(),
      ]);
      if (!u || !c) return;
      await sendPaymentReceiptEmail({
        to: u.email,
        firstName: u.firstName,
        courseTitle: c.title,
        courseCode: c.code,
        method,
        amountTnd: totals.tndDue,
        coinsUsed: totals.coinsUsed,
        providerRef,
        paidAt,
      });
    } catch (err) {
      console.warn("[checkout] receipt email failed:", err);
    }
  })();

  return {
    ok: true,
    paymentId: String(payment._id),
    enrollmentId: enrollResult.enrollmentId,
    coinsUsed: totals.coinsUsed,
    tndCharged: totals.tndDue,
  };
}
