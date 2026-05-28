#!/usr/bin/env tsx
/**
 * One-shot SMTP smoke test. Reads .env, opens an SMTP connection to whatever
 * provider is configured, and sends a real email to istabrakbenkhmays8@gmail.com.
 *
 * Run:  npx tsx scripts/test-email.ts
 *
 * Tells you the exact failure reason (auth rejected, from-address rejected,
 * recipient rejected, network, etc.) — no guessing from server logs.
 */
import "dotenv/config";
import nodemailer from "nodemailer";

// Recipient: CLI arg wins, otherwise default to our Gmail account.
const TO = process.argv[2] ?? "istabrakbenkhmays8@gmail.com";

async function main() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM;

  console.log("--- SMTP config from .env ---");
  console.log(`  host:      ${host}`);
  console.log(`  port:      ${port}`);
  console.log(`  user:      ${user}`);
  console.log(`  pass:      ${pass ? `${pass.slice(0, 8)}... (${pass.length} chars)` : "(EMPTY!)"}`);
  console.log(`  MAIL_FROM: ${from}`);
  console.log(`  → sending test mail to: ${TO}`);
  console.log("");

  if (!host || !user || !pass || !from) {
    console.error("❌ One or more SMTP env vars are missing. Aborting.");
    process.exit(1);
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    console.log("→ Verifying SMTP connection (TLS + AUTH)…");
    await transport.verify();
    console.log("✅ SMTP connection OK — credentials accepted.\n");
  } catch (err: any) {
    console.error("❌ SMTP verify failed:");
    console.error(`   ${err?.message ?? err}`);
    if (err?.code) console.error(`   code: ${err.code}`);
    if (err?.responseCode) console.error(`   responseCode: ${err.responseCode}`);
    process.exit(1);
  }

  try {
    console.log("→ Sending test email…");
    const info = await transport.sendMail({
      from,
      to: TO,
      subject: "Advancia — SMTP test from your dev machine",
      html: `<h1>It works!</h1><p>If you can read this in Gmail, your Resend SMTP setup is live. You can now use the forgot-password flow on the platform.</p>`,
      text: "It works! If you can read this in Gmail, your Resend SMTP setup is live.",
    });
    console.log("✅ Email accepted by SMTP server.");
    console.log(`   messageId: ${info.messageId}`);
    console.log(`   response : ${info.response}`);
    console.log(`   accepted : ${JSON.stringify(info.accepted)}`);
    console.log(`   rejected : ${JSON.stringify(info.rejected)}`);
    console.log("\nNow check your Gmail inbox (and Spam folder). It usually arrives in < 10 seconds.");
  } catch (err: any) {
    console.error("❌ sendMail failed:");
    console.error(`   ${err?.message ?? err}`);
    if (err?.code) console.error(`   code: ${err.code}`);
    if (err?.responseCode) console.error(`   responseCode: ${err.responseCode}`);
    if (err?.response) console.error(`   response: ${err.response}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
