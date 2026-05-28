import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "@/components/ui/Logo";
import { getT } from "@/src/i18n/server";

type Contact = {
  email: string;
  flag: React.ReactNode;
  country: string;
};

function FlagFR() {
  return (
    <svg viewBox="0 0 3 2" aria-hidden className="block h-full w-full">
      <rect width="1" height="2" x="0" fill="#0055A4" />
      <rect width="1" height="2" x="1" fill="#FFFFFF" />
      <rect width="1" height="2" x="2" fill="#EF4135" />
    </svg>
  );
}
function FlagMA() {
  return (
    <svg viewBox="0 0 3 2" aria-hidden className="block h-full w-full">
      <rect width="3" height="2" fill="#C1272D" />
      <g transform="translate(1.5 1) scale(0.35)" fill="none" stroke="#006233" strokeWidth="0.1">
        <polygon points="0,-1 0.225,-0.31 0.951,-0.31 0.363,0.118 0.588,0.809 0,0.382 -0.588,0.809 -0.363,0.118 -0.951,-0.31 -0.225,-0.31" />
      </g>
    </svg>
  );
}
function FlagTN() {
  return (
    <svg viewBox="0 0 3 2" aria-hidden className="block h-full w-full">
      <rect width="3" height="2" fill="#E70013" />
      <circle cx="1.5" cy="1" r="0.45" fill="#FFFFFF" />
      <polygon points="1.62,0.72 1.685,0.92 1.895,0.92 1.725,1.04 1.79,1.24 1.62,1.12 1.45,1.24 1.515,1.04 1.345,0.92 1.555,0.92" fill="#E70013" />
    </svg>
  );
}
function FlagCI() {
  return (
    <svg viewBox="0 0 3 2" aria-hidden className="block h-full w-full">
      <rect width="1" height="2" x="0" fill="#F77F00" />
      <rect width="1" height="2" x="1" fill="#FFFFFF" />
      <rect width="1" height="2" x="2" fill="#009E60" />
    </svg>
  );
}

const CONTACTS: Contact[] = [
  { country: "France", email: "contact@advancia-training.com", flag: <FlagFR /> },
  { country: "Morocco", email: "info.maroc@advancia-training.com", flag: <FlagMA /> },
  { country: "Tunisia", email: "service-clients@advancia-training.com", flag: <FlagTN /> },
  { country: "Côte d'Ivoire", email: "info.ci@advancia-training.com", flag: <FlagCI /> },
];

export async function Footer() {
  const year = new Date().getFullYear();
  const { t } = await getT();
  return (
    <footer className="mt-20 border-t border-border bg-neutral-950 text-white">
      {/* Newsletter */}
      <Container size="wide">
        <div className="grid items-center gap-6 border-b border-white/10 py-10 md:grid-cols-2">
          <div>
            <h3 className="text-3xl font-bold tracking-tight">{t.newsletter.title}</h3>
            <p className="mt-1 text-sm text-white/80">{t.newsletter.body}</p>
          </div>
          <form className="flex w-full items-stretch gap-0 rounded-md bg-white">
            <input
              type="email"
              required
              name="email"
              placeholder={t.newsletter.placeholder}
              className="h-12 flex-1 rounded-s-md bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center rounded-e-md bg-brand px-6 text-sm font-semibold uppercase tracking-wider text-brand-foreground hover:bg-brand-600"
            >
              {t.newsletter.subscribe}
            </button>
          </form>
        </div>

        {/* 4 columns */}
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo height={48} className="text-white" />
            <p className="mt-4 max-w-xs text-sm text-white/70">{t.footer.tagline}</p>
          </div>

          <div>
            <h4 className="mb-4 text-base font-semibold">{t.footerExt.liensUtiles}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/catalog" className="inline-flex items-center gap-2 hover:text-white">
                  <span aria-hidden className="text-brand">›</span> {t.nav.formations}
                </Link>
              </li>
              <li>
                <Link href="/catalog?group=Security" className="inline-flex items-center gap-2 hover:text-white">
                  <span aria-hidden className="text-brand">›</span> {t.nav.certifications}
                </Link>
              </li>
              <li>
                <Link href="/calendrier" className="inline-flex items-center gap-2 hover:text-white">
                  <span aria-hidden className="text-brand">›</span> {t.nav.calendrier}
                </Link>
              </li>
              <li>
                <Link href="/#partners" className="inline-flex items-center gap-2 hover:text-white">
                  <span aria-hidden className="text-brand">›</span> {t.nav.partners}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex items-center gap-2 hover:text-white">
                  <span aria-hidden className="text-brand">›</span> {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-base font-semibold">{t.footerExt.informations}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/about" className="inline-flex items-center gap-2 hover:text-white">
                  <span aria-hidden className="text-brand">›</span> {t.footerExt.jobs}
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-flex items-center gap-2 hover:text-white">
                  <span aria-hidden className="text-brand">›</span> {t.footerExt.presentation}
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-flex items-center gap-2 hover:text-white">
                  <span aria-hidden className="text-brand">›</span> {t.footerExt.resources}
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-flex items-center gap-2 hover:text-white">
                  <span aria-hidden className="text-brand">›</span> {t.footerExt.ourGroup}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-base font-semibold">{t.footerExt.contactCol}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              {CONTACTS.map((c) => (
                <li key={c.country} className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white/30">
                    {c.flag}
                  </span>
                  <a href={`mailto:${c.email}`} className="hover:text-white">
                    {c.email}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: Facebook, href: "https://facebook.com/advancia.training" },
                { icon: Linkedin, href: "https://linkedin.com/company/advancia-training" },
                { icon: Instagram, href: "https://instagram.com/advancia.training" },
                { icon: Youtube, href: "https://youtube.com/@advancia-training" },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-brand-foreground transition hover:bg-brand-600"
                  aria-label={href}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
          © {year} Advancia Training. {t.footer.allRightsReserved}
        </div>
      </Container>
    </footer>
  );
}
