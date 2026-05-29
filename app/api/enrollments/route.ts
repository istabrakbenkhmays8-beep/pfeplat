import { z } from "zod";
import { getSession } from "@/lib/session";
import { enroll } from "@/src/services/enrollmentService";

export const runtime = "nodejs";

const schema = z.object({ courseCode: z.string().min(1).max(40) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthenticated" }, { status: 401 });
  }

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

  const result = await enroll(session.user.id, parsed.data.courseCode);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 404 });
  }
  return Response.json(result, { status: 200 });
}
