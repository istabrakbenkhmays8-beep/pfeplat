/**
 * POST /api/wallet/buy-coins
 *
 * Mock credit-card top-up. Records a Payment with method="card", a CoinTransaction
 * with reason="admin_grant" (closest existing reason — the model schema's enum could
 * grow a "purchase_top_up" later), and credits the user's wallet.
 *
 * In production this is where Paymee / Konnect / Flouci would be called.
 */
import { z } from "zod";
import { Types } from "mongoose";
import { getSession } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { CoinTransaction, Payment, User } from "@/src/models";
import { sendMail, renderEmail } from "@/src/services/emailService";
import { env } from "@/lib/env";

export const runtime = "nodejs";

// Mirror the catalog from /wallet/buy/page.tsx. The API is authoritative — the
// client can't quote a pack we don't know about.
const PACKS: Record<string, { coins: number; tnd: number; label: string }> = {
  starter: { coins: 500, tnd: 40, label: "Starter pack" },
  boost: { coins: 1500, tnd: 100, label: "Boost pack" },
  pro: { coins: 4000, tnd: 240, label: "Pro pack" },
};

const schema = z.object({
  packId: z.enum(["starter", "boost", "pro"]),
  cardLast4: z.string().regex(/^\d{4}$/),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "ValidationError" }, { status: 400 });

  const pack = PACKS[parsed.data.packId];
  if (!pack) return Response.json({ error: "UnknownPack" }, { status: 400 });

  await connectDb();
  const uid = new Types.ObjectId(session.user.id);

  // 1) Payment row (mock provider always succeeds).
  const providerRef = `MOCK-COINS-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const payment = await Payment.create({
    user: uid,
    provider: "mock",
    providerRef,
    method: "card",
    amountTnd: pack.tnd,
    coinsUsed: 0,
    status: "succeeded",
    paidAt: new Date(),
  });

  // 2) Credit the wallet + record a coin transaction.
  const u = await User.findById(uid).select("walletCoins email firstName");
  if (!u) return Response.json({ error: "NotFound" }, { status: 404 });
  u.walletCoins = (u.walletCoins ?? 0) + pack.coins;
  await u.save();
  await CoinTransaction.create({
    user: uid,
    delta: pack.coins,
    reason: "admin_grant", // closest existing reason; add "purchase_top_up" later if you want richer reporting
    balanceAfter: u.walletCoins,
    payment: payment._id,
    note: `${pack.label} — ${pack.coins} coins for ${pack.tnd} DT`,
  });

  // 3) Receipt email — fire-and-forget so a flaky SMTP can't roll back the top-up.
  (async () => {
    try {
      await sendMail({
        to: u.email,
        subject: `Receipt — ${pack.coins} coins added`,
        html: renderEmail({
          title: "Coins added to your wallet",
          bodyHtml: `
            <p>Hi ${u.firstName}, thanks for topping up.</p>
            <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:14px;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;font-size:13px">
              <tr><td style="padding:10px 14px;background:#f9fafb;color:#666">Pack</td><td style="padding:10px 14px;text-align:right"><strong>${pack.label}</strong></td></tr>
              <tr><td style="padding:10px 14px;background:#f9fafb;color:#666;border-top:1px solid #f1f5f9">Coins added</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #f1f5f9"><strong>+${pack.coins}</strong></td></tr>
              <tr><td style="padding:10px 14px;background:#f9fafb;color:#666;border-top:1px solid #f1f5f9">New balance</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #f1f5f9">${u.walletCoins} coins</td></tr>
              <tr><td style="padding:10px 14px;background:#f9fafb;color:#666;border-top:1px solid #f1f5f9">Charged</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #f1f5f9"><strong>${pack.tnd} DT</strong></td></tr>
              <tr><td style="padding:10px 14px;background:#f9fafb;color:#666;border-top:1px solid #f1f5f9">Reference</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #f1f5f9;font-family:monospace;font-size:11px">${providerRef}</td></tr>
            </table>
          `,
          ctaHref: `${env().NEXTAUTH_URL.replace(/\/$/, "")}/wallet`,
          ctaLabel: "Open my wallet",
        }),
        text: `Receipt — ${pack.label}. +${pack.coins} coins. Charged ${pack.tnd} DT. New balance ${u.walletCoins}. Ref ${providerRef}.`,
      });
    } catch (err) {
      console.warn("[buy-coins] receipt email failed:", err);
    }
  })();

  return Response.json({
    ok: true,
    coinsCredited: pack.coins,
    newBalance: u.walletCoins,
    providerRef,
  });
}
