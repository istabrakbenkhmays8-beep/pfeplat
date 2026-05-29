import { requireRole } from "@/lib/session";
import { courseInputSchema } from "@/lib/validators/courseSchema";
import { createCourse } from "@/src/services/courseService";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await requireRole("admin");
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = courseInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "ValidationError", issues: parsed.error.flatten() }, { status: 400 });
  }
  const result = await createCourse(parsed.data);
  if (!result.ok) return Response.json({ error: result.error }, { status: 409 });
  return Response.json(result, { status: 201 });
}
