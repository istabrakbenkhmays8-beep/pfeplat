import nodemailer from "nodemailer";
import { env } from "@/lib/env";

let cachedTransport: nodemailer.Transporter | null = null;

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

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Send mail. In dev, when SMTP env vars are missing, logs to the console and
 * returns ok=true so the rest of the app behaves normally.
 */
export async function sendMail(input: SendMailInput): Promise<{ ok: true; delivered: boolean }> {
  const t = getTransport();
  if (!t) {
    // Dev fallback — print to server logs so the developer can see the link.
    console.info("[email] (no SMTP configured — would have sent):");
    console.info(`  to:      ${input.to}`);
    console.info(`  subject: ${input.subject}`);
    console.info(`  body:    ${input.text ?? input.html.replace(/<[^>]+>/g, "").slice(0, 400)}`);
    return { ok: true, delivered: false };
  }
  await t.sendMail({
    from: env().MAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  return { ok: true, delivered: true };
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
          Sent by Advancia Training — Tunis · Casablanca · Aix-en-Provence · Abidjan
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
