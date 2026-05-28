import { requireRole } from "@/lib/session";
import { courseInputSchema } from "@/lib/validators/courseSchema";
import { deleteCourse, updateCourse } from "@/src/services/courseService";

export const runtime = "nodejs";

type RouteParams = Promise<{ id: string }>;

export async function PATCH(req: Request, { params }: { params: RouteParams }) {
  await requireRole("admin");
  const { id } = await params;
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
  const result = await updateCourse(id, parsed.data);
  if (!result.ok) {
    return Response.json({ error: result.error }, {
      status: result.error === "CourseNotFound" ? 404 : 409,
    });
  }
  return Response.json(result);
}

export async function DELETE(_req: Request, { params }: { params: RouteParams }) {
  await requireRole("admin");
  const { id } = await params;
  const result = await deleteCourse(id);
  if (!result.ok) return Response.json({ error: result.error }, { status: 404 });
  return Response.json(result);
}
