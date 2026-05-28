import { z } from "zod";
import { startReset } from "@/src/services/passwordResetService";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  // Always respond ok=true to avoid email-enumeration. We don't reveal whether the email exists.
  if (!parsed.success) {
    return Response.json({ ok: true });
  }
  await startReset(parsed.data.email);
  return Response.json({ ok: true });
}
