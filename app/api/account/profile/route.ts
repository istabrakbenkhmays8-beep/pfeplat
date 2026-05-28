/**
 * PATCH /api/account/profile
 *
 * Lets any authenticated user (learner, admin, super admin) update their own profile fields:
 *   firstName, surname, email, country, avatarUrl
 *
 * Sensitive things are intentionally NOT here — role + status are admin-controlled,
 * password lives at /api/account/password.
 *
 * The avatar can be a data URL (after client-side downscaling) or any http(s) URL.
 * We cap it at ~400 KB so a runaway upload can't bloat the document.
 */
import { z } from "zod";
import { Types } from "mongoose";
import { getSession } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { User, AuditLog } from "@/src/models";

export const runtime = "nodejs";

const AVATAR_MAX_CHARS = 400 * 1024; // ~300 KB once base64-decoded.

const schema = z
  .object({
    firstName: z.string().trim().min(1).max(80).optional(),
    surname: z.string().trim().min(1).max(80).optional(),
    email: z.string().trim().toLowerCase().email().max(120).optional(),
    country: z.string().trim().max(80).optional().nullable(),
    avatarUrl: z
      .string()
      .max(AVATAR_MAX_CHARS, "Image too large — please use a smaller photo")
      .optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "ValidationError", issues: parsed.error.flatten() }, { status: 400 });
  }

  await connectDb();
  const uid = new Types.ObjectId(session.user.id);

  // Email uniqueness: if changing, ensure nobody else owns it.
  if (parsed.data.email) {
    const collision = await User.findOne({ email: parsed.data.email, _id: { $ne: uid } })
      .select("_id")
      .lean<{ _id: unknown } | null>();
    if (collision) {
      return Response.json({ error: "EmailInUse" }, { status: 409 });
    }
  }

  // Avatar value: reject anything that isn't a data URL, http(s) URL, or empty (to clear).
  if (parsed.data.avatarUrl !== undefined && parsed.data.avatarUrl !== "") {
    const v = parsed.data.avatarUrl;
    const isData = v.startsWith("data:image/");
    const isHttp = /^https?:\/\//i.test(v);
    if (!isData && !isHttp) {
      return Response.json({ error: "InvalidAvatar" }, { status: 400 });
    }
  }

  // Build $set; null country means "clear it".
  const $set: Record<string, unknown> = {};
  if (parsed.data.firstName !== undefined) $set.firstName = parsed.data.firstName;
  if (parsed.data.surname !== undefined) $set.surname = parsed.data.surname;
  if (parsed.data.email !== undefined) $set.email = parsed.data.email;
  if (parsed.data.country !== undefined) $set.country = parsed.data.country ?? "";
  if (parsed.data.avatarUrl !== undefined) $set.avatarUrl = parsed.data.avatarUrl;

  await User.updateOne({ _id: uid }, { $set });

  // Audit the self-update so admins can investigate later if needed.
  await AuditLog.create({
    actor: uid,
    actorRole: session.user.role,
    action: "account.profile_updated",
    targetType: "User",
    targetId: uid,
    metadata: { fields: Object.keys($set) },
  });

  const fresh = await User.findById(uid)
    .select("firstName surname email country avatarUrl")
    .lean<{ firstName: string; surname: string; email: string; country?: string; avatarUrl?: string } | null>();

  return Response.json({ ok: true, user: fresh });
}
