import { z } from "zod";
import { requireRole } from "@/lib/session";
import { demoteAdmin, updateAdmin } from "@/src/services/adminService";

export const runtime = "nodejs";

const patchSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  surname: z.string().trim().min(1).max(80).optional(),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
});

type RouteParams = Promise<{ id: string }>;

/** PATCH /api/super-admin/admins/[id] — edit profile + status. */
export async function PATCH(req: Request, { params }: { params: RouteParams }) {
  const session = await requireRole("super_admin");
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "ValidationError" }, { status: 400 });

  const r = await updateAdmin(id, parsed.data, session.user.id);
  if (!r.ok) return Response.json({ error: r.error }, { status: 404 });
  return Response.json(r);
}

/**
 * DELETE /api/super-admin/admins/[id] — "delete" = demote back to a regular
 * user. We never drop the User row because they may own audit-log entries,
 * enrollments, or content.
 */
export async function DELETE(_req: Request, { params }: { params: RouteParams }) {
  const session = await requireRole("super_admin");
  const { id } = await params;

  // Defensive: don't let a super admin demote themselves into oblivion through
  // the admins page. (Wouldn't match the role filter anyway since we filter
  // role=admin, but it's worth being explicit.)
  if (id === session.user.id) {
    return Response.json({ error: "CannotDemoteSelf" }, { status: 400 });
  }

  const r = await demoteAdmin(id, session.user.id);
  if (!r.ok) return Response.json({ error: r.error }, { status: 404 });
  return Response.json(r);
}
