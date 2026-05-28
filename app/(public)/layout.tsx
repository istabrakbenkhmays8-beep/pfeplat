import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getT } from "@/src/i18n/server";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getT();
  const nav = [
    { href: "/catalog", label: t.nav.formations },
    { href: "/calendrier", label: t.nav.calendrier },
    { href: "/catalog?group=Security", label: t.nav.certifications },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <>
      <Header variant="public" nav={nav} />
      <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
