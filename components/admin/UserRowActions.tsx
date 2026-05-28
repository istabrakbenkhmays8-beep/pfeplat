"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { USER_ROLES, USER_STATUSES, type UserRole, type UserStatus } from "@/src/models";

export function StatusCell({
  userId,
  status,
  canChange,
}: {
  userId: string;
  status: UserStatus;
  canChange: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState<UserStatus>(status);
  const [pending, startTransition] = useTransition();

  function colorFor(s: UserStatus) {
    if (s === "active") return "bg-success/10 text-success border-success/30";
    if (s === "disabled" || s === "banned") return "bg-danger/10 text-danger border-danger/30";
    return "bg-muted text-muted-foreground border-border";
  }

  async function apply(next: UserStatus) {
    setValue(next);
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body?.error === "CannotChangeOwnStatus" ? "You can't change your own status." : "Could not update.");
        setValue(status);
        return;
      }
      toast.success(`Status set to ${next}`);
      router.refresh();
    });
  }

  if (!canChange) {
    return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${colorFor(value)}`}>{value}</span>;
  }

  return (
    <select
      value={value}
      onChange={(e) => apply(e.target.value as UserStatus)}
      disabled={pending}
      className={`h-7 rounded-full border px-2 text-xs font-medium ${colorFor(value)} focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60`}
    >
      {USER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export function RoleCell({
  userId,
  role,
  canChange,
}: {
  userId: string;
  role: UserRole;
  canChange: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState<UserRole>(role);
  const [pending, startTransition] = useTransition();

  async function apply(next: UserRole) {
    setValue(next);
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (!res.ok) {
        toast.error("Could not change role.");
        setValue(role);
        return;
      }
      toast.success(`Role set to ${next}`);
      router.refresh();
    });
  }

  if (!canChange) {
    return <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{value}</span>;
  }

  return (
    <select
      value={value}
      onChange={(e) => apply(e.target.value as UserRole)}
      disabled={pending}
      className="h-7 rounded-full border border-border bg-surface px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
    >
      {USER_ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
