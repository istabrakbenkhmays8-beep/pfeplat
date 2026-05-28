import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/session";

const nav = [
  { href: "/super-admin", label: "Overview" },
  { href: "/super-admin/admins", label: "Admins" },
  { href: "/super-admin/reservations", label: "Reservations" },
  { href: "/super-admin/trainers", label: "Trainers" },
  { href: "/super-admin/audit", label: "Audit log" },
  { href: "/super-admin/settings", label: "Settings" },
];

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("super_admin");
  return (
    <AppShell navItems={nav} sidebarTitle="Super admin">
      {children}
    </AppShell>
  );
}
