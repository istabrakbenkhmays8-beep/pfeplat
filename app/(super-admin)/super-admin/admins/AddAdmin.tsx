"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Plus, UserPlus2, X } from "lucide-react";

type Mode = "create" | "promote";

export function AddAdmin() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    email: "",
    password: "",
    country: "",
  });

  function reset() {
    setForm({ firstName: "", surname: "", email: "", password: "", country: "" });
    setMode("create");
  }

  async function save() {
    if (mode === "promote") {
      if (!form.email.trim()) {
        toast.error("Email required");
        return;
      }
    } else {
      if (!form.firstName.trim() || !form.surname.trim() || !form.email.trim() || form.password.length < 8) {
        toast.error("All fields required, password ≥ 8 chars");
        return;
      }
    }
    setBusy(true);
    try {
      const body =
        mode === "promote"
          ? { action: "promote", email: form.email }
          : form;
      const res = await fetch("/api/super-admin/admins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data?.error === "AlreadyAdmin" ? "That user is already an admin."
          : data?.error === "EmailInUse" ? "Email already used by a learner — use Promote instead."
          : data?.error === "UserNotFoundOrAlreadyAdmin" ? "No learner found with that email."
          : data?.error === "PasswordTooShort" ? "Password must be ≥ 8 characters."
          : "Could not create admin.";
        toast.error(msg);
        return;
      }
      toast.success(mode === "promote" ? "User promoted to admin" : "Admin created");
      setOpen(false);
      reset();
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
        <Plus className="h-4 w-4" /> Add admin
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 sm:min-w-[460px]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">{mode === "create" ? "New admin" : "Promote existing user"}</p>
        <button type="button" onClick={() => { setOpen(false); reset(); }} aria-label="Cancel" className="text-muted-foreground hover:text-fg">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Mode toggle */}
      <div className="mb-3 inline-flex rounded-md border border-border bg-surface p-0.5 text-xs">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`rounded px-3 py-1.5 font-medium ${mode === "create" ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-fg"}`}
        >
          Create new
        </button>
        <button
          type="button"
          onClick={() => setMode("promote")}
          className={`inline-flex items-center gap-1 rounded px-3 py-1.5 font-medium ${mode === "promote" ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-fg"}`}
        >
          <UserPlus2 className="h-3 w-3" /> Promote learner
        </button>
      </div>

      {mode === "create" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["firstName", "First name"],
              ["surname", "Surname"],
              ["email", "Email"],
              ["password", "Initial password (≥ 8 chars)"],
              ["country", "Country (optional)"],
            ] as Array<[keyof typeof form, string]>
          ).map(([key, label]) => (
            <label key={key} className="text-xs text-muted-foreground">
              {label}
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                type={key === "email" ? "email" : key === "password" ? "password" : "text"}
                className="mt-1 block h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg"
              />
            </label>
          ))}
        </div>
      ) : (
        <label className="block text-xs text-muted-foreground">
          Email of an existing learner
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            type="email"
            placeholder="learner@example.com"
            className="mt-1 block h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Their role will change from <code className="rounded bg-muted px-1">user</code> to <code className="rounded bg-muted px-1">admin</code> immediately.
          </p>
        </label>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={() => { setOpen(false); reset(); }} className="inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 text-xs hover:bg-muted">
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1 rounded-md bg-brand px-4 text-xs font-semibold text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-3 w-3 animate-spin" />}
          {mode === "create" ? "Save admin" : "Promote"}
        </button>
      </div>
    </div>
  );
}
