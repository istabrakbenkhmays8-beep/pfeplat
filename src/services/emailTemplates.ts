/**
 * Three branded transactional emails Advancia sends to learners:
 *   1. welcome  → fired after /api/auth/register
 *   2. paymentReceipt → fired after a successful checkout
 *   3. passwordReset → fired by /api/auth/forgot
 *
 * Each helper returns { to, subject, html, text } so the caller can feed it straight
 * into sendMail(). Subjects + bodies are intentionally distinct so users can spot
 * them at a glance in their inbox.
 */
import { env } from "@/lib/env";
import { renderEmail, sendMail } from "./emailService";

function siteBase(): string {
  return env().NEXTAUTH_URL.replace(/\/$/, "");
}

// ─────────────────────────────────────────────────────────────────────────────
// 1) Welcome email — after registration
// ─────────────────────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(opts: { to: string; firstName: string }) {
  const link = `${siteBase()}/auth/login`;
  return sendMail({
    to: opts.to,
    subject: "Welcome to Advancia Training — your account is ready",
    html: renderEmail({
      title: `Welcome, ${opts.firstName}!`,
      bodyHtml: `
        <p>Your Advancia Training account is live. You can sign in straight away and start exploring.</p>
        <p>Here's what's waiting for you:</p>
        <ul style="padding-left:18px;margin:12px 0;color:#333">
          <li><strong>30+ certified courses</strong> across Microsoft, Cisco, Fortinet, PMI and more</li>
          <li><strong>Game challenges</strong> — earn coins while you learn</li>
          <li><strong>Live online + on-site sessions</strong> from the June 2026 calendar</li>
        </ul>
        <p style="color:#666;font-size:12px;margin-top:18px">Need help? Just reply to this email — a human reads every reply.</p>
      `,
      ctaHref: link,
      ctaLabel: "Sign in to your account",
    }),
    text: `Welcome to Advancia Training, ${opts.firstName}! Sign in at ${link} to start learning.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) Payment receipt — after a successful checkout
// ─────────────────────────────────────────────────────────────────────────────
export async function sendPaymentReceiptEmail(opts: {
  to: string;
  firstName: string;
  courseTitle: string;
  courseCode: string;
  method: "card" | "wallet" | "card_plus_wallet";
  amountTnd: number;
  coinsUsed: number;
  providerRef: string;
  paidAt: Date;
}) {
  const methodLabel =
    opts.method === "wallet"
      ? `Paid with ${opts.coinsUsed} coins from your wallet`
      : opts.method === "card_plus_wallet"
      ? `Card + ${opts.coinsUsed} coins`
      : "Credit card";

  const courseLink = `${siteBase()}/my-courses`;
  const dateLabel = opts.paidAt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return sendMail({
    to: opts.to,
    subject: `Receipt for ${opts.courseCode} — Advancia Training`,
    html: renderEmail({
      title: "Payment confirmed",
      bodyHtml: `
        <p>Hi ${opts.firstName}, thanks for your purchase. You're enrolled in <strong>${opts.courseTitle}</strong> and can start whenever you're ready.</p>

        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:18px;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;font-size:13px">
          <tr><td style="padding:10px 14px;background:#f9fafb;color:#666">Course</td><td style="padding:10px 14px;text-align:right"><strong>${opts.courseCode}</strong> · ${opts.courseTitle}</td></tr>
          <tr><td style="padding:10px 14px;background:#f9fafb;color:#666;border-top:1px solid #f1f5f9">Method</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #f1f5f9">${methodLabel}</td></tr>
          <tr><td style="padding:10px 14px;background:#f9fafb;color:#666;border-top:1px solid #f1f5f9">Amount</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #f1f5f9"><strong>${opts.amountTnd.toLocaleString("en-GB")} DT</strong>${opts.coinsUsed > 0 ? ` <span style="color:#999">(+ ${opts.coinsUsed} coins)</span>` : ""}</td></tr>
          <tr><td style="padding:10px 14px;background:#f9fafb;color:#666;border-top:1px solid #f1f5f9">Reference</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #f1f5f9;font-family:monospace;font-size:11px">${opts.providerRef}</td></tr>
          <tr><td style="padding:10px 14px;background:#f9fafb;color:#666;border-top:1px solid #f1f5f9">Date</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #f1f5f9">${dateLabel}</td></tr>
        </table>

        <p style="margin-top:18px;color:#666;font-size:12px">Keep this email for your records. If anything looks off, reply to this message and we'll sort it out.</p>
      `,
      ctaHref: courseLink,
      ctaLabel: "Go to my courses",
    }),
    text: `Receipt — ${opts.courseCode} ${opts.courseTitle}. ${methodLabel}. Amount: ${opts.amountTnd} DT${opts.coinsUsed > 0 ? ` (+ ${opts.coinsUsed} coins)` : ""}. Ref: ${opts.providerRef}. Date: ${dateLabel}.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) Password reset link — see passwordResetService.startReset for the call site.
//    Kept here so all three templates live in one place; passwordResetService
//    re-exports through this module for consistency.
// ─────────────────────────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(opts: { to: string; firstName: string; resetLink: string }) {
  return sendMail({
    to: opts.to,
    subject: "Reset your Advancia Training password",
    html: renderEmail({
      title: "Reset your password",
      bodyHtml: `
        <p>Hi ${opts.firstName},</p>
        <p>We received a request to reset your password. Click the button below to choose a new one — the link expires in 30 minutes.</p>
        <p style="margin-top:18px;color:#666;font-size:12px">If you didn't ask for a reset, you can safely ignore this email. Your password stays the same.</p>
      `,
      ctaHref: opts.resetLink,
      ctaLabel: "Choose a new password",
    }),
    text: `Reset your Advancia Training password: ${opts.resetLink} (link expires in 30 minutes)`,
  });
}
