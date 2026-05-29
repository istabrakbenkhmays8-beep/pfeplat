"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Plus, X } from "lucide-react";

export function AddTrainer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    email: "",
    specialty: "",
    country: "",
  });

  async function save() {
    if (!form.firstName.trim() || !form.surname.trim() || !form.email.trim()) {
      toast.error("Name + email required");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/super-admin/trainers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error === "EmailInUse" ? "Email already in use" : "Could not add trainer");
        return;
      }
      toast.success("Trainer added");
      setOpen(false);
      setForm({ firstName: "", surname: "", email: "", specialty: "", country: "" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
      >
        <Plus className="h-4 w-4" /> Add trainer
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">New trainer</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cancel" className="text-muted-foreground hover:text-fg">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["firstName", "First name"],
            ["surname", "Surname"],
            ["email", "Email"],
            ["specialty", "Specialty"],
            ["country", "Country"],
          ] as Array<[keyof typeof form, string]>
        ).map(([key, label]) => (
          <label key={key} className="text-xs text-muted-foreground">
            {label}
            <input
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              type={key === "email" ? "email" : "text"}
              className="mt-1 block h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg"
            />
          </label>
        ))}
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 text-xs hover:bg-muted">
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1 rounded-md bg-brand px-4 text-xs font-semibold text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-3 w-3 animate-spin" />}
          Save trainer
        </button>
      </div>
    </div>
  );
}
