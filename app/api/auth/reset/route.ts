import { z } from "zod";
import { finishReset } from "@/src/services/passwordResetService";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(120),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "ValidationError" }, { status: 400 });
  }
  const r = await finishReset(parsed.data.token, parsed.data.password);
  if (!r.ok) return Response.json({ error: r.error }, { status: 400 });
  return Response.json({ ok: true });
}
