import { z } from "zod";
import { requireRole } from "@/lib/session";
import { createAdmin, listAdmins, promoteToAdmin } from "@/src/services/adminService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  surname: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  country: z.string().trim().max(80).optional().or(z.literal("")),
});

const promoteSchema = z.object({
  action: z.literal("promote"),
  email: z.string().trim().toLowerCase().email(),
});

/** GET /api/super-admin/admins → { items: AdminRow[] } */
export async function GET() {
  await requireRole("super_admin");
  const items = await listAdmins();
  return Response.json({ items });
}

/**
 * POST /api/super-admin/admins
 *   - default body: { firstName, surname, email, password, country? } → create new admin
 *   - alt body:     { action: "promote", email }                       → promote existing user
 */
export async function POST(req: Request) {
  const session = await requireRole("super_admin");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }

  // Promote path: existing user → admin
  if (body && typeof body === "object" && (body as any).action === "promote") {
    const parsed = promoteSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "ValidationError" }, { status: 400 });
    const r = await promoteToAdmin(parsed.data.email, session.user.id);
    if (!r.ok) return Response.json({ error: r.error }, { status: 404 });
    return Response.json(r, { status: 200 });
  }

  // Create path
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "ValidationError", issues: parsed.error.flatten() }, { status: 400 });
  }
  const r = await createAdmin(parsed.data, session.user.id);
  if (!r.ok) {
    const status = r.error === "EmailInUse" || r.error === "AlreadyAdmin" ? 409 : 400;
    return Response.json({ error: r.error }, { status });
  }
  return Response.json(r, { status: 201 });
}
