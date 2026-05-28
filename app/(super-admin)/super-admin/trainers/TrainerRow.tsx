"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Trainer = {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  specialty: string;
  country: string;
  isActive: boolean;
};

export function TrainerRow({ trainer }: { trainer: Trainer }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...trainer });

  function save() {
    startTransition(async () => {
      const res = await fetch(`/api/super-admin/trainers/${trainer.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        toast.error("Could not save");
        return;
      }
      toast.success("Trainer updated");
      setEditing(false);
      router.refresh();
    });
  }

  function toggleActive() {
    startTransition(async () => {
      const res = await fetch(`/api/super-admin/trainers/${trainer.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive: !trainer.isActive }),
      });
      if (!res.ok) {
        toast.error("Could not toggle");
        return;
      }
      toast.success(trainer.isActive ? "Trainer disabled" : "Trainer activated");
      router.refresh();
    });
  }

  if (editing) {
    return (
      <tr className="bg-muted/30">
        <td colSpan={6} className="px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {(
              [
                ["firstName", "First"],
                ["surname", "Surname"],
                ["email", "Email"],
                ["specialty", "Specialty"],
                ["country", "Country"],
              ] as Array<[keyof Trainer, string]>
            ).map(([key, label]) => (
              <label key={key} className="text-xs text-muted-foreground">
                {label}
                <input
                  value={String(form[key])}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="mt-1 block h-9 w-full rounded-md border border-border bg-surface px-2 text-sm text-fg"
                />
              </label>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-xs hover:bg-muted">
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
        {trainer.firstName} {trainer.surname}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{trainer.email}</td>
      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{trainer.specialty || "—"}</td>
      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{trainer.country || "—"}</td>
      <td className="whitespace-nowrap px-4 py-3">
        <button
          type="button"
          onClick={toggleActive}
          disabled={pending}
          className={
            trainer.isActive
              ? "rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success hover:bg-success/20"
              : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-border"
          }
        >
          {trainer.isActive ? "active" : "disabled"}
        </button>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-end">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs font-medium text-brand hover:underline"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}
