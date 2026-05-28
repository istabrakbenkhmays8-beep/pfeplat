import { Header } from "./Header";
import { Sidebar, type SidebarItem } from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";

export function AppShell({
  children,
  navItems,
  sidebarTitle,
}: {
  children: React.ReactNode;
  navItems: SidebarItem[];
  sidebarTitle?: string;
}) {
  return (
    <SidebarProvider>
      <Header variant="app" />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
        <Sidebar items={navItems} title={sidebarTitle} />
        <main className="min-w-0 flex-1 py-6 md:py-8">{children}</main>
      </div>
    </SidebarProvider>
  );
}
