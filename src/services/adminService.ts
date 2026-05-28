/**
 * Super-admin "Manage admins" CRUD.
 *
 * An "admin" in this platform is just a User row with role="admin"; there is
 * no separate Admin model. These helpers are scoped wrappers around the User
 * model that:
 *   - list / create / promote / demote / deactivate admins
 *   - hash the new admin's password with bcrypt before storage
 *   - never expose passwordHash to callers
 *
 * Returned shapes are plain JSON so they cross the network cleanly.
 */
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { AuditLog, User } from "@/src/models";

export type AdminRow = {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  status: string;
  country?: string;
  createdAt: string;
  lastLoginAt?: string | null;
};

export type CreateAdminInput = {
  firstName: string;
  surname: string;
  email: string;
  password: string;
  country?: string;
};

function toRow(u: any): AdminRow {
  return {
    id: String(u._id),
    firstName: u.firstName ?? "",
    surname: u.surname ?? "",
    email: u.email,
    status: u.status ?? "active",
    country: u.country,
    createdAt: new Date(u.createdAt).toISOString(),
    lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
  };
}

export async function listAdmins(): Promise<AdminRow[]> {
  await connectDb();
  const rows = await User.find({ role: "admin" })
    .select("firstName surname email status country createdAt lastLoginAt")
    .sort({ createdAt: -1 })
    .lean<any[]>();
  return rows.map(toRow);
}

export async function createAdmin(
  input: CreateAdminInput,
  actorId: string,
): Promise<{ ok: true; admin: AdminRow } | { ok: false; error: string }> {
  await connectDb();
  const email = input.email.trim().toLowerCase();

  // Reject duplicates regardless of role — same email shouldn't exist twice.
  const existing = await User.findOne({ email }).select("_id role");
  if (existing) {
    // If the existing user is already a learner, the cleanest "create admin"
    // is a promotion — we surface that as a distinct error so the UI can offer
    // a one-click "Promote existing user" instead of forcing a duplicate.
    return { ok: false, error: existing.role === "admin" ? "AlreadyAdmin" : "EmailInUse" };
  }

  if (input.password.length < 8) {
    return { ok: false, error: "PasswordTooShort" };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const u = await User.create({
    firstName: input.firstName.trim(),
    surname: input.surname.trim(),
    email,
    passwordHash,
    role: "admin",
    status: "active",
    emailVerifiedAt: new Date(), // admins are pre-verified — they're created by a super_admin
    country: input.country?.trim(),
  });

  await AuditLog.create({
    actor: new Types.ObjectId(actorId),
    actorRole: "super_admin",
    action: "admin.created",
    targetType: "User",
    targetId: u._id,
    metadata: { email },
  });

  return { ok: true, admin: toRow(u.toObject()) };
}

/**
 * Patch an admin: name, country, status. Email + role + password aren't
 * editable here on purpose (email changes need verification, role changes
 * go through promote/demote, password reset is its own flow).
 */
export async function updateAdmin(
  id: string,
  patch: Partial<{ firstName: string; surname: string; country: string; status: "active" | "inactive" }>,
  actorId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDb();
  if (!Types.ObjectId.isValid(id)) return { ok: false, error: "InvalidId" };

  const set: Record<string, unknown> = {};
  if (patch.firstName !== undefined) set.firstName = patch.firstName.trim();
  if (patch.surname !== undefined) set.surname = patch.surname.trim();
  if (patch.country !== undefined) set.country = patch.country.trim();
  if (patch.status !== undefined) set.status = patch.status;

  const u = await User.findOneAndUpdate(
    { _id: new Types.ObjectId(id), role: "admin" },
    { $set: set },
    { new: true },
  );
  if (!u) return { ok: false, error: "NotFound" };

  await AuditLog.create({
    actor: new Types.ObjectId(actorId),
    actorRole: "super_admin",
    action: "admin.updated",
    targetType: "User",
    targetId: u._id,
    after: set,
  });

  return { ok: true };
}

/**
 * "Delete" = demote back to a regular user. We intentionally don't drop the
 * User document — they may own audit-log entries, enrollments, or content
 * — but they lose all admin capability immediately.
 */
export async function demoteAdmin(
  id: string,
  actorId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDb();
  if (!Types.ObjectId.isValid(id)) return { ok: false, error: "InvalidId" };

  const u = await User.findOneAndUpdate(
    { _id: new Types.ObjectId(id), role: "admin" },
    { $set: { role: "user" } },
    { new: true },
  );
  if (!u) return { ok: false, error: "NotFound" };

  await AuditLog.create({
    actor: new Types.ObjectId(actorId),
    actorRole: "super_admin",
    action: "admin.demoted",
    targetType: "User",
    targetId: u._id,
    metadata: { email: u.email },
  });

  return { ok: true };
}

/**
 * Promote an existing user to admin. Convenient counterpart to demoteAdmin —
 * lets the super admin elevate a learner who's been around without making
 * them re-register.
 */
export async function promoteToAdmin(
  email: string,
  actorId: string,
): Promise<{ ok: true; admin: AdminRow } | { ok: false; error: string }> {
  await connectDb();
  const u = await User.findOneAndUpdate(
    { email: email.trim().toLowerCase(), role: "user" },
    { $set: { role: "admin" } },
    { new: true },
  ).lean<any>();
  if (!u) return { ok: false, error: "UserNotFoundOrAlreadyAdmin" };

  await AuditLog.create({
    actor: new Types.ObjectId(actorId),
    actorRole: "super_admin",
    action: "admin.promoted",
    targetType: "User",
    targetId: u._id,
    metadata: { email: u.email },
  });

  return { ok: true, admin: toRow(u) };
}
