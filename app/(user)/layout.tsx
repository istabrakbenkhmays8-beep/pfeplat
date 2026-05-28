import { AppShell } from "@/components/layout/AppShell";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/my-courses", label: "My courses" },
  { href: "/wallet", label: "Coins & wallet" },
  { href: "/certificates", label: "Certificates" },
  { href: "/calendar", label: "Calendar" },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell navItems={nav} sidebarTitle="Your learning">
      {children}
    </AppShell>
  );
}
