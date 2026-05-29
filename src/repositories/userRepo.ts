import { connectDb } from "@/lib/db";
import { Enrollment, User, USER_ROLES, USER_STATUSES } from "@/src/models";
import type { UserRole, UserStatus } from "@/src/models";

export type UserListFilters = {
  q?: string;
  role?: UserRole | "all";
  status?: UserStatus | "all";
  country?: string | "all";
  level?: string | "all";
};

export type UserRow = {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  gender: string;
  age: number | null;
  country: string;
  level: string;
  role: UserRole;
  status: UserStatus;
  walletCoins: number;
  registeredOn: string; // ISO
  coursesJoined: number;
};

export function isRole(v: string | undefined): v is UserRole {
  return !!v && (USER_ROLES as readonly string[]).includes(v);
}

export function isStatus(v: string | undefined): v is UserStatus {
  return !!v && (USER_STATUSES as readonly string[]).includes(v);
}

function buildFilter(f: UserListFilters): Record<string, unknown> {
  const q: Record<string, unknown> = {};
  if (f.role && f.role !== "all") q.role = f.role;
  if (f.status && f.status !== "all") q.status = f.status;
  if (f.country && f.country !== "all") q.country = f.country;
  if (f.level && f.level !== "all") q.level = f.level;
  if (f.q && f.q.trim()) {
    const rx = new RegExp(f.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    q.$or = [{ firstName: rx }, { surname: rx }, { email: rx }];
  }
  return q;
}

export async function listUsersForAdmin(f: UserListFilters): Promise<UserRow[]> {
  await connectDb();
  const filter = buildFilter(f);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .lean<any[]>();

  if (users.length === 0) return [];

  // Bulk count enrollments per user
  const ids = users.map((u) => u._id);
  const counts = await Enrollment.aggregate([
    { $match: { user: { $in: ids } } },
    { $group: { _id: "$user", n: { $sum: 1 } } },
  ]);
  const countMap = new Map<string, number>(counts.map((c: any) => [String(c._id), c.n]));

  return users.map((u) => ({
    id: String(u._id),
    firstName: u.firstName ?? "",
    surname: u.surname ?? "",
    email: u.email ?? "",
    gender: u.gender ?? "prefer_not_to_say",
    age: typeof u.age === "number" ? u.age : null,
    country: u.country ?? "",
    level: u.level ?? "beginner",
    role: u.role,
    status: u.status,
    walletCoins: u.walletCoins ?? 0,
    registeredOn: (u.createdAt as Date).toISOString(),
    coursesJoined: countMap.get(String(u._id)) ?? 0,
  }));
}

export async function listCountries(): Promise<string[]> {
  await connectDb();
  const rows = (await User.distinct("country")) as (string | null | undefined)[];
  return rows.filter((c): c is string => !!c && c.length > 0).sort();
}
