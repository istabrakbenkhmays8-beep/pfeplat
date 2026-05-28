import { AppShell } from "@/components/layout/AppShell";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/imports", label: "Imports" },
  { href: "/admin/exports", label: "Exports" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell navItems={nav} sidebarTitle="Admin">
      {children}
    </AppShell>
  );
}
