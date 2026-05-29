import { z } from "zod";
import { getSession } from "@/lib/session";
import { completeEnrollment } from "@/src/services/enrollmentService";

export const runtime = "nodejs";

const schema = z.object({ enrollmentId: z.string().length(24) });

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

  const r = await completeEnrollment(session.user.id, parsed.data.enrollmentId);
  if (!r.ok) return Response.json({ error: r.error }, { status: 404 });
  return Response.json(r, { status: 200 });
}
