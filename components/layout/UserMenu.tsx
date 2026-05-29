"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { LogOut, LayoutDashboard, Coins, UserCircle2 } from "lucide-react";

type Labels = {
  signIn: string;
  getStarted: string;
  dashboard: string;
  coins: string;
  profile: string;
  signOut: string;
};

const DEFAULT_LABELS: Labels = {
  signIn: "Sign in",
  getStarted: "Get started",
  dashboard: "Dashboard",
  coins: "Coins",
  profile: "Profile",
  signOut: "Sign out",
};

export function UserMenu({ variant, labels = DEFAULT_LABELS }: { variant: "public" | "app"; labels?: Labels }) {
  const { data, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Loading: avoid layout shift, render placeholder buttons.
  if (status === "loading") {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-muted" aria-hidden />;
  }

  if (!data?.user) {
    if (variant === "app") return null;
    return (
      <>
        <Link
          href="/auth/login"
          className="hidden sm:inline-flex h-9 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-fg hover:bg-muted"
        >
          {labels.signIn}
        </Link>
        <Link
          href="/auth/register"
          className="inline-flex h-9 items-center whitespace-nowrap rounded-md bg-brand px-3 text-sm font-medium text-brand-foreground hover:bg-brand-600"
        >
          {labels.getStarted}
        </Link>
      </>
    );
  }

  const user = data.user;
  const initials =
    user.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || user.email[0]?.toUpperCase();

  const dashHref =
    user.role === "super_admin" ? "/super-admin" : user.role === "admin" ? "/admin" : "/dashboard";
  const roleLabel =
    user.role === "super_admin" ? "Super admin" : user.role === "admin" ? "Admin" : "Learner";

  // The avatar can be a data URL (from /profile upload) or any http(s) URL.
  // We render <img> directly for both — next/image refuses arbitrary data URLs.
  const avatar = user.avatarUrl ?? null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface pe-3 ps-1 text-sm font-medium hover:bg-muted"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
            {initials}
          </span>
        )}
        <span className="hidden sm:inline">{user.name?.split(" ")[0] || "Account"}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <div className="border-b border-border bg-muted/30 p-4">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
              {roleLabel}
            </p>
          </div>
          <ul className="p-2">
            <li>
              <Link
                href={dashHref}
                role="menuitem"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                {labels.dashboard}
              </Link>
            </li>
            {user.role === "user" && (
              <li>
                <Link
                  href="/wallet"
                  role="menuitem"
                  className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <span className="flex items-center gap-3">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    {labels.coins}
                  </span>
                  <span className="font-semibold text-brand">{user.walletCoins}</span>
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/profile"
                role="menuitem"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                {labels.profile}
              </Link>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-fg hover:bg-muted"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
                {labels.signOut}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
