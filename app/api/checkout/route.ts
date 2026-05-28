import { z } from "zod";
import { getSession } from "@/lib/session";
import { checkout } from "@/src/services/paymentService";

export const runtime = "nodejs";

const schema = z.object({
  courseCode: z.string().min(1).max(40),
  coinsToUse: z.coerce.number().min(0).default(0),
  cardLast4: z.string().regex(/^\d{4}$/).default("4242"),
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

  const r = await checkout({ userId: session.user.id, ...parsed.data });
  if (!r.ok) return Response.json({ error: r.error }, { status: 400 });
  return Response.json(r);
}
