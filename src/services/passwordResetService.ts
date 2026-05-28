import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { env } from "@/lib/env";
import { EmailToken, User } from "@/src/models";
import { sendPasswordResetEmail } from "./emailTemplates";

const RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes

type StartResetResult = {
  ok: true;
  delivered: boolean;
  previewResetLink?: string;
};

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

/**
 * Begin a password reset. Always returns ok=true even if the email isn't on file
 * (no enumeration). When the email IS on file we issue a hashed token and email
 * an /auth/reset-password link.
 */
export async function startReset(email: string): Promise<StartResetResult> {
  await connectDb();
  const u = await User.findOne({ email: email.toLowerCase().trim() }).select("_id email firstName");
  if (!u) return { ok: true, delivered: false };

  const token = crypto.randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await EmailToken.create({
    user: u._id,
    tokenHash: sha256(token),
    type: "reset_password",
    expiresAt,
  });

  const link = `${env().NEXTAUTH_URL.replace(/\/$/, "")}/auth/reset-password?token=${token}`;
  try {
    const mail = await sendPasswordResetEmail({
      to: u.email,
      firstName: u.firstName ?? "there",
      resetLink: link,
    });
    if (mail.delivered) {
      return { ok: true, delivered: true };
    }
  } catch (error) {
    console.warn("[forgot-password] reset email failed:", error);
  }

  if (env().NODE_ENV !== "production") {
    return { ok: true, delivered: false, previewResetLink: link };
  }

  return { ok: true, delivered: false };
}

export async function finishReset(token: string, newPassword: string) {
  if (!token || newPassword.length < 8) {
    return { ok: false as const, error: "InvalidInput" as const };
  }
  await connectDb();
  const tokenHash = sha256(token);
  const record = await EmailToken.findOne({ tokenHash, type: "reset_password" });
  if (!record) return { ok: false as const, error: "InvalidToken" as const };
  if (record.usedAt) return { ok: false as const, error: "TokenAlreadyUsed" as const };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false as const, error: "TokenExpired" as const };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.updateOne(
    { _id: record.user },
    { $set: { passwordHash, failedLoginCount: 0, lockedUntil: null } },
  );
  await EmailToken.updateOne({ _id: record._id }, { $set: { usedAt: new Date() } });

  // Invalidate any other reset tokens for this user as a security measure.
  await EmailToken.deleteMany({
    user: record.user,
    type: "reset_password",
    _id: { $ne: record._id as Types.ObjectId },
  });

  return { ok: true as const };
}
