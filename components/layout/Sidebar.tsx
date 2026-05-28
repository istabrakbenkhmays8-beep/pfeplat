"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { useSidebar } from "./SidebarContext";

export type SidebarItem = { href: string; label: string; icon?: React.ReactNode };

export function Sidebar({ items, title }: { items: SidebarItem[]; title?: string }) {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          "transition-opacity",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-72 border-e border-border bg-surface transition-transform md:sticky md:top-16 md:z-0 md:h-[calc(100dvh-4rem)] md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col overflow-y-auto p-4">
          {title && (
            <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
          )}
          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-brand text-brand-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-fg",
                  )}
                >
                  {item.icon && <span aria-hidden>{item.icon}</span>}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
