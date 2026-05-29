"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Admin = {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  status: string;
  country?: string;
  createdAt: string;
};

export function AdminRow({ admin }: { admin: Admin }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: admin.firstName,
    surname: admin.surname,
    country: admin.country ?? "",
  });

  function save() {
    startTransition(async () => {
      const res = await fetch(`/api/super-admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        toast.error("Could not save");
        return;
      }
      toast.success("Admin updated");
      setEditing(false);
      router.refresh();
    });
  }

  function toggleStatus() {
    startTransition(async () => {
      const next = admin.status === "active" ? "inactive" : "active";
      const res = await fetch(`/api/super-admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        toast.error("Could not toggle");
        return;
      }
      toast.success(next === "active" ? "Admin activated" : "Admin deactivated");
      router.refresh();
    });
  }

  function demote() {
    if (!confirm(`Demote ${admin.firstName} ${admin.surname} back to a regular learner? They lose admin access immediately.`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/super-admin/admins/${admin.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error === "CannotDemoteSelf" ? "You can't demote your own account here." : "Could not demote");
        return;
      }
      toast.success("Admin demoted to learner");
      router.refresh();
    });
  }

  if (editing) {
    return (
      <tr className="bg-muted/30">
        <td colSpan={6} className="px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-3">
            {(
              [
                ["firstName", "First"],
                ["surname", "Surname"],
                ["country", "Country"],
              ] as Array<[keyof typeof form, string]>
            ).map(([key, label]) => (
              <label key={key} className="text-xs text-muted-foreground">
                {label}
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="mt-1 block h-9 w-full rounded-md border border-border bg-surface px-2 text-sm text-fg"
                />
              </label>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-xs hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="inline-flex h-8 items-center rounded-md bg-brand px-3 text-xs font-semibold text-brand-foreground disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-muted/40">
      <td className="whitespace-nowrap px-4 py-3 font-medium">
        {admin.firstName} {admin.surname}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{admin.email}</td>
      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{admin.country || "—"}</td>
      <td className="whitespace-nowrap px-4 py-3">
        <button
          type="button"
          onClick={toggleStatus}
          disabled={pending}
          className={
            admin.status === "active"
              ? "rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success hover:bg-success/20"
              : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-border"
          }
        >
          {admin.status}
        </button>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
        {new Date(admin.createdAt).toLocaleDateString()}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-end">
        <div className="inline-flex gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-brand hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={demote}
            disabled={pending}
            className="text-xs font-medium text-danger hover:underline disabled:opacity-60"
          >
            Demote
          </button>
        </div>
      </td>
    </tr>
  );
}
