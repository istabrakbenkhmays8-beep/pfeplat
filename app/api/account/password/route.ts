/**
 * POST /api/account/password
 *
 * Self-service password change. Requires the user's current password — we never
 * let an authenticated session change the password blind, because session theft
 * would otherwise let an attacker lock the real user out.
 *
 * On success, all existing reset tokens are invalidated as a defence-in-depth
 * measure (same posture as passwordResetService.finishReset).
 */
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { getSession } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { User, EmailToken, AuditLog } from "@/src/models";

export const runtime = "nodejs";

const schema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8, "WeakPassword").max(200),
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
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return Response.json({ error: first === "WeakPassword" ? "WeakPassword" : "ValidationError" }, { status: 400 });
  }

  await connectDb();
  const uid = new Types.ObjectId(session.user.id);

  // We need passwordHash, which is `select: false` on the schema — explicitly add it.
  const u = await User.findById(uid).select("+passwordHash email");
  if (!u) return Response.json({ error: "NotFound" }, { status: 404 });

  const ok = await bcrypt.compare(parsed.data.currentPassword, u.passwordHash);
  if (!ok) return Response.json({ error: "WrongPassword" }, { status: 400 });

  u.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await u.save();

  // Invalidate any outstanding reset tokens for this user so an old emailed link
  // can't be used to take over the account after a self-change.
  await EmailToken.deleteMany({ user: uid, type: "reset_password" });

  await AuditLog.create({
    actor: uid,
    actorRole: session.user.role,
    action: "account.password_changed",
    targetType: "User",
    targetId: uid,
  });

  return Response.json({ ok: true });
}
