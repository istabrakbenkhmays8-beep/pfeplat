import nodemailer from "nodemailer";
import { env } from "@/lib/env";

let cachedTransport: nodemailer.Transporter | null = null;

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendMailResult = {
  ok: true;
  delivered: boolean;
  reason: "sent" | "missing_config" | "transport_error";
};

function extractEmailAddress(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const match = trimmed.match(/<([^>]+)>/);
  const candidate = (match?.[1] ?? trimmed).trim();
  return candidate.includes("@") ? candidate : null;
}

function buildSmtpFromAddress(): string | null {
  const smtpUser = env().SMTP_USER?.trim();
  if (!smtpUser || !smtpUser.includes("@")) return null;
  return `Advancia Training <${smtpUser}>`;
}

function getTransport(): nodemailer.Transporter | null {
  if (cachedTransport) return cachedTransport;
  const e = env();
  if (!e.SMTP_HOST || !e.SMTP_PORT || !e.SMTP_USER || !e.SMTP_PASS) {
    return null;
  }
  cachedTransport = nodemailer.createTransport({
    host: e.SMTP_HOST,
    port: e.SMTP_PORT,
    secure: e.SMTP_PORT === 465,
    auth: { user: e.SMTP_USER, pass: e.SMTP_PASS },
  });
  return cachedTransport;
}

/**
 * Send mail. When SMTP is missing, we log the message locally instead of pretending
 * it reached a real inbox. If the configured sender address is rejected by the
 * provider, retry once with the authenticated SMTP user as the sender.
 */
export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const t = getTransport();
  if (!t) {
    console.info("[email] (no SMTP configured - would have sent):");
    console.info(`  to:      ${input.to}`);
    console.info(`  subject: ${input.subject}`);
    console.info(`  body:    ${input.text ?? input.html.replace(/<[^>]+>/g, "").slice(0, 400)}`);
    return { ok: true, delivered: false, reason: "missing_config" };
  }

  const primaryFrom = env().MAIL_FROM;
  const primaryFromEmail = extractEmailAddress(primaryFrom);
  const smtpFrom = buildSmtpFromAddress();
  const smtpFromEmail = extractEmailAddress(smtpFrom ?? undefined);

  try {
    await t.sendMail({
      from: primaryFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return { ok: true, delivered: true, reason: "sent" };
  } catch (error) {
    const canRetryWithSmtpSender = smtpFrom && smtpFromEmail && primaryFromEmail && smtpFromEmail !== primaryFromEmail;
    if (!canRetryWithSmtpSender) {
      console.warn("[email] send failed:", error);
      return { ok: true, delivered: false, reason: "transport_error" };
    }

    try {
      console.warn("[email] send failed with MAIL_FROM, retrying with SMTP_USER sender:", error);
      await t.sendMail({
        from: smtpFrom,
        replyTo: primaryFrom,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      return { ok: true, delivered: true, reason: "sent" };
    } catch (retryError) {
      console.warn("[email] retry with SMTP_USER sender also failed:", retryError);
      return { ok: true, delivered: false, reason: "transport_error" };
    }
  }
}

/** A minimal branded email shell. */
export function renderEmail(opts: { title: string; bodyHtml: string; ctaHref?: string; ctaLabel?: string }): string {
  const cta = opts.ctaHref
    ? `<a href="${opts.ctaHref}" style="display:inline-block;padding:12px 22px;background:#E30613;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-family:Helvetica,Arial,sans-serif">${opts.ctaLabel ?? "Open"}</a>`
    : "";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Helvetica,Arial,sans-serif">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:30px 0">
    <tr><td align="center">
      <table width="560" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden">
        <tr><td style="padding:24px 28px;border-bottom:3px solid #E30613">
          <span style="font-size:20px;font-weight:900;letter-spacing:1px;color:#E30613">ADVANCIA</span>
          <span style="font-size:11px;letter-spacing:6px;color:#666;margin-left:8px">TRAINING</span>
        </td></tr>
        <tr><td style="padding:32px 28px;color:#111">
          <h1 style="margin:0 0 16px;font-size:22px">${opts.title}</h1>
          <div style="color:#333;line-height:1.6;font-size:14px">${opts.bodyHtml}</div>
          ${cta ? `<div style="margin-top:24px">${cta}</div>` : ""}
        </td></tr>
        <tr><td style="padding:20px 28px;background:#f4f4f5;color:#666;font-size:12px">
          Sent by Advancia Training - Tunis | Casablanca | Aix-en-Provence | Abidjan
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
