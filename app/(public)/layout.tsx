import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const nav = [
  { href: "/catalog", label: "Courses" },
  { href: "/contact", label: "Contact" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="public" nav={nav} />
      <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
