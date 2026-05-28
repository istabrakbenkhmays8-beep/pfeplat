import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import type { UserRole } from "@/src/models";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  return session;
}

const roleRank: Record<UserRole, number> = {
  visitor: 0,
  user: 1,
  admin: 2,
  super_admin: 3,
};

/**
 * Require at least the given role. Redirects to /auth/login if unauthenticated,
 * or to / if authenticated but lacking the required level.
 */
export async function requireRole(min: UserRole) {
  const session = await requireSession();
  if (roleRank[session.user.role] < roleRank[min]) {
    redirect("/");
  }
  return session;
}
