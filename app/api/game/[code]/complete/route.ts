import { z } from "zod";
import { getSession } from "@/lib/session";
import { completeGame } from "@/src/services/gameService";

export const runtime = "nodejs";

type RouteParams = Promise<{ code: string }>;

const schema = z.object({
  score: z.coerce.number().min(0).max(50),
  total: z.coerce.number().min(1).max(50),
});

export async function POST(req: Request, { params }: { params: RouteParams }) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const { code } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "ValidationError" }, { status: 400 });

  const r = await completeGame({
    userId: session.user.id,
    code: decodeURIComponent(code),
    score: parsed.data.score,
    total: parsed.data.total,
  });
  if (!r.ok) return Response.json({ error: r.error }, { status: 404 });
  return Response.json(r);
}
