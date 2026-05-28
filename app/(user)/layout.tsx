import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/session";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/my-courses", label: "My courses" },
  { href: "/wallet", label: "Coins & wallet" },
  { href: "/certificates", label: "Certificates" },
  { href: "/calendar", label: "Calendar" },
];

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  await requireRole("user");
  return (
    <AppShell navItems={nav} sidebarTitle="Your learning">
      {children}
    </AppShell>
  );
}
