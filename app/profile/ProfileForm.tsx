"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Camera, Loader2, Lock, Mail, Save, Trash2, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const MAX_AVATAR_BYTES = 250 * 1024; // 250 KB after client-side downscale.

type Initial = {
  firstName: string;
  surname: string;
  email: string;
  avatarUrl: string;
  country: string;
  roleLabel: string;
  walletCoins: number;
  memberSince: string | null;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  // Three independent sections — each saves on its own so the user can change one
  // thing at a time without re-typing the rest.
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <SidePanel initial={initial} />
      <div className="space-y-6">
        <AvatarSection
          initial={initial}
          onSaved={() => {
            router.refresh();
            updateSession();
          }}
        />
        <IdentitySection
          initial={initial}
          onSaved={() => {
            router.refresh();
            updateSession();
          }}
        />
        <PasswordSection />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — read-only summary so the user always sees who they are
// ─────────────────────────────────────────────────────────────────────────────
function SidePanel({ initial }: { initial: Initial }) {
  const initials =
    `${initial.firstName?.[0] ?? ""}${initial.surname?.[0] ?? ""}`.toUpperCase() || "U";
  return (
    <aside className="space-y-4 self-start rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col items-center text-center">
        <AvatarBubble src={initial.avatarUrl} initials={initials} size={96} />
        <p className="mt-3 font-semibold">
          {initial.firstName} {initial.surname}
        </p>
        <p className="text-xs text-muted-foreground">{initial.email}</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
          {initial.roleLabel}
        </span>
      </div>
      <hr className="border-border" />
      <dl className="space-y-2 text-xs">
        {initial.country && (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Country</dt>
            <dd className="font-medium">{initial.country}</dd>
          </div>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Coins</dt>
          <dd className="font-mono font-semibold text-brand">{initial.walletCoins}</dd>
        </div>
        {initial.memberSince && (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="font-medium">
              {new Date(initial.memberSince).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </dd>
          </div>
        )}
      </dl>
    </aside>
  );
}

function AvatarBubble({
  src,
  initials,
  size,
}: {
  src?: string;
  initials: string;
  size: number;
}) {
  if (src) {
    // The avatar might be a data URL (post-upload) or any http(s) URL — both work in <img>.
    // We use a plain <img> for data URLs because next/image complains about unknown sources.
    if (src.startsWith("data:")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Your profile photo"
          width={size}
          height={size}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      );
    }
    return (
      <Image
        src={src}
        alt="Your profile photo"
        width={size}
        height={size}
        className="rounded-full object-cover"
        unoptimized
      />
    );
  }
  return (
    <div
      className="inline-flex items-center justify-center rounded-full bg-brand text-2xl font-bold text-brand-foreground"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar — upload OR paste a URL. We downscale client-side to keep the DB small.
// ─────────────────────────────────────────────────────────────────────────────
function AvatarSection({ initial, onSaved }: { initial: Initial; onSaved: () => void }) {
  const [preview, setPreview] = useState(initial.avatarUrl);
  const [pasteUrl, setPasteUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(initial.avatarUrl);
  }, [initial.avatarUrl]);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Pick an image file.");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await downscaleToDataUrl(file, 320, 0.82);
      // Sanity-check size — refuse anything obviously huge.
      if (dataUrl.length > MAX_AVATAR_BYTES * 1.4) {
        toast.error("Image is too large after downscaling. Try a smaller photo.");
        return;
      }
      await saveAvatar(dataUrl);
      setPreview(dataUrl);
    } finally {
      setBusy(false);
    }
  }

  async function saveAvatar(value: string) {
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ avatarUrl: value }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data?.error ?? "Couldn't save photo");
      return;
    }
    toast.success("Profile photo updated");
    onSaved();
  }

  async function applyUrl() {
    if (!pasteUrl.trim()) return;
    setBusy(true);
    try {
      await saveAvatar(pasteUrl.trim());
      setPreview(pasteUrl.trim());
      setPasteUrl("");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    setBusy(true);
    try {
      await saveAvatar("");
      setPreview("");
    } finally {
      setBusy(false);
    }
  }

  const initials =
    `${initial.firstName?.[0] ?? ""}${initial.surname?.[0] ?? ""}`.toUpperCase() || "U";

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4 text-brand" />
        <h2 className="text-base font-semibold">Profile photo</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload a picture from your device, or paste a link to one. Images are resized to 320 × 320.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-5">
        <AvatarBubble src={preview} initials={initials} size={88} />
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-3 text-sm font-semibold text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            Upload photo
          </button>
          {preview && (
            <button
              type="button"
              onClick={removePhoto}
              disabled={busy}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="paste-url" className="text-xs font-medium text-muted-foreground">
          …or paste an image URL
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="paste-url"
            type="url"
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            placeholder="https://…"
            className="h-9 flex-1 rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={busy || !pasteUrl.trim()}
            className="inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Use URL
          </button>
        </div>
      </div>
    </section>
  );
}

/** Resize an image File to ≤ maxDim on the long side, return JPEG data URL. */
async function downscaleToDataUrl(file: File, maxDim: number, quality: number): Promise<string> {
  const blobUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new globalThis.Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Couldn't decode image"));
      i.src = blobUrl;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Identity — name + email
// ─────────────────────────────────────────────────────────────────────────────
function IdentitySection({ initial, onSaved }: { initial: Initial; onSaved: () => void }) {
  const [firstName, setFirstName] = useState(initial.firstName);
  const [surname, setSurname] = useState(initial.surname);
  const [email, setEmail] = useState(initial.email);
  const [country, setCountry] = useState(initial.country);
  const [busy, setBusy] = useState(false);

  const dirty =
    firstName !== initial.firstName ||
    surname !== initial.surname ||
    email !== initial.email ||
    country !== initial.country;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName, surname, email, country }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error === "EmailInUse" ? "That email is already taken." : data?.error ?? "Couldn't save");
        return;
      }
      toast.success("Profile updated");
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <UserIcon className="h-4 w-4 text-brand" />
        <h2 className="text-base font-semibold">Identity</h2>
      </div>

      <form onSubmit={save} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="first" label="First name">
            <input
              id="first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              required
              maxLength={80}
            />
          </Field>
          <Field id="surname" label="Surname">
            <input
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              required
              maxLength={80}
            />
          </Field>
        </div>

        <Field id="email" label="Email address" icon={<Mail className="h-4 w-4 text-muted-foreground" />}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-surface ps-9 pe-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            required
            maxLength={120}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            You&rsquo;ll sign in with this email going forward.
          </p>
        </Field>

        <Field id="country" label="Country (optional)">
          <input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Tunisia, France, Morocco…"
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            maxLength={80}
          />
        </Field>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy || !dirty}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition",
              dirty && !busy
                ? "bg-brand text-brand-foreground hover:bg-brand-600"
                : "bg-muted text-muted-foreground",
            )}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </form>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Password — requires the current one
// ─────────────────────────────────────────────────────────────────────────────
function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const tooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && confirm !== next;
  const canSubmit =
    current.length >= 1 && next.length >= 8 && next === confirm && !busy;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        const map: Record<string, string> = {
          WrongPassword: "Current password is incorrect.",
          WeakPassword: "Use at least 8 characters.",
          NotFound: "We couldn't find your account.",
        };
        toast.error(map[data?.error] ?? data?.error ?? "Couldn't change password");
        return;
      }
      toast.success("Password changed — use it next time you sign in.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-brand" />
        <h2 className="text-base font-semibold">Password</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose something at least 8 characters long. You&rsquo;ll need to enter your current password to confirm.
      </p>

      <form onSubmit={save} className="mt-5 space-y-4">
        <Field id="cur" label="Current password">
          <input
            id="cur"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="new" label="New password">
            <input
              id="new"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={cn(
                "h-10 w-full rounded-md border bg-surface px-3 text-sm focus:outline-none focus:ring-2",
                tooShort ? "border-rose-400 focus:ring-rose-400/20" : "border-border focus:border-brand focus:ring-brand/20",
              )}
              required
              minLength={8}
            />
            {tooShort && <p className="mt-1 text-xs text-rose-500">At least 8 characters.</p>}
          </Field>
          <Field id="confirm" label="Confirm new password">
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={cn(
                "h-10 w-full rounded-md border bg-surface px-3 text-sm focus:outline-none focus:ring-2",
                mismatch ? "border-rose-400 focus:ring-rose-400/20" : "border-border focus:border-brand focus:ring-brand/20",
              )}
              required
            />
            {mismatch && <p className="mt-1 text-xs text-rose-500">Doesn&rsquo;t match.</p>}
          </Field>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition",
              canSubmit ? "bg-brand text-brand-foreground hover:bg-brand-600" : "bg-muted text-muted-foreground",
            )}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Change password
          </button>
        </div>
      </form>
    </section>
  );
}

// Small labelled field wrapper.
function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className={cn("relative mt-1", icon ? "isolate" : "")}>
        {icon && <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2">{icon}</span>}
        {children}
      </div>
    </div>
  );
}
