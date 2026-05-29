import { z } from "zod";
import { Types } from "mongoose";
import { requireRole } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { User, USER_ROLES, USER_STATUSES } from "@/src/models";

export const runtime = "nodejs";

type RouteParams = Promise<{ id: string }>;

const patchSchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
});

export async function PATCH(req: Request, { params }: { params: RouteParams }) {
  const session = await requireRole("admin");
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    return Response.json({ error: "InvalidId" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "ValidationError", issues: parsed.error.flatten() }, { status: 400 });
  }

  // Only super_admin can promote / demote
  if (parsed.data.role && session.user.role !== "super_admin") {
    return Response.json({ error: "Forbidden", message: "Only super admins can change roles." }, { status: 403 });
  }

  // Don't let admins disable themselves accidentally
  if (id === session.user.id && parsed.data.status && parsed.data.status !== "active") {
    return Response.json({ error: "CannotChangeOwnStatus" }, { status: 400 });
  }

  await connectDb();
  const update: Record<string, unknown> = {};
  if (parsed.data.role) update.role = parsed.data.role;
  if (parsed.data.status) update.status = parsed.data.status;

  const u = await User.findByIdAndUpdate(id, { $set: update }, { new: true })
    .select("role status")
    .lean<any>();
  if (!u) return Response.json({ error: "NotFound" }, { status: 404 });

  return Response.json({ ok: true, role: u.role, status: u.status });
}
