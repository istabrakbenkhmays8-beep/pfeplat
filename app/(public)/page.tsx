import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { KpiCard } from "@/components/ui/KpiCard";
import { CourseCard } from "@/components/cards/CourseCard";
import { VideoHero } from "@/components/home/VideoHero";
import { LearningFormats } from "@/components/home/LearningFormats";
import { NetworkMap } from "@/components/home/NetworkMap";
import { PartnersCarousel } from "@/components/home/PartnersCarousel";
import {
  countByGroup,
  countByVendor,
  getFeaturedCourses,
  headlineStats,
} from "@/src/repositories/courseRepo";
import { getT } from "@/src/i18n/server";

export const dynamic = "force-dynamic";

const testimonials = [
  {
    quote:
      "The trainer was exceptional. I left with practical confidence and passed the certification on first attempt.",
    name: "Yacine B.",
    role: "Cloud engineer · AZ-104 alumni",
  },
  {
    quote:
      "Best ROI we've had on training in years. Our SOC team is operational on day one after the bootcamp.",
    name: "Sarra K.",
    role: "CISO · Banking sector",
  },
  {
    quote:
      "Hybrid sessions made it work for a distributed team across 3 countries. Highly recommended.",
    name: "Mohamed A.",
    role: "Head of IT · Telco",
  },
];

export default async function HomePage() {
  const [{ t }, stats, vendors, groups, featured] = await Promise.all([
    getT(),
    headlineStats(),
    countByVendor(),
    countByGroup(),
    getFeaturedCourses(8),
  ]);

  return (
    <>
      {/* HERO with background video */}
      <VideoHero />

      {/* LES CHIFFRES */}
      <section className="border-b border-border">
        <Container size="wide" className="py-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.byTheNumbers}</h2>
          <p className="mt-2 text-muted-foreground">{t.home.byTheNumbersBlurb}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard value={`${stats.yearsOfExperience}+`} label={t.home.yearsExpertise} hint={t.home.yearsExpertiseHint} />
            <KpiCard value={`${stats.courses}+`} label={t.home.coursesAvailable} hint={t.home.coursesAvailableHint} />
            <KpiCard value={`${stats.vendors}`} label={t.home.authorizedPartners} hint={t.home.authorizedPartnersHint} />
            <KpiCard value={`${stats.domains}`} label={t.home.competencyDomains} hint={t.home.competencyDomainsHint} />
          </div>
        </Container>
      </section>

      {/* LEARNING FORMATS — official-site styling */}
      <LearningFormats />

      {/* BROWSE BY VENDOR */}
      <section className="border-b border-border">
        <Container size="wide" className="py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.browseByPartner}</h2>
              <p className="mt-2 text-muted-foreground">{t.home.browseByPartnerBlurb}</p>
            </div>
            <Link href="/catalog" className="text-sm font-medium text-brand hover:underline">
              {t.home.seeAllCourses}
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {vendors.map((v) => (
              <Link
                key={v.vendor}
                href={`/catalog?vendor=${encodeURIComponent(v.vendor)}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold">{v.vendor}</p>
                  <p className="text-xs text-muted-foreground">{v.count} {v.count === 1 ? "course" : "courses"}</p>
                </div>
                <span className="text-muted-foreground group-hover:text-brand" aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* BROWSE BY DOMAIN */}
      <section className="border-b border-border bg-muted/30">
        <Container size="wide" className="py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.browseByDomain}</h2>
              <p className="mt-2 text-muted-foreground">{t.home.browseByDomainBlurb}</p>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {groups.map((g) => (
              <Link
                key={g.group}
                href={`/catalog?group=${encodeURIComponent(g.group)}`}
                className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-sm"
              >
                <div className="mb-3 h-10 w-10 rounded-md bg-brand/10" aria-hidden />
                <p className="font-semibold">{g.group}</p>
                <p className="text-sm text-muted-foreground">{g.count} {g.count === 1 ? "course" : "courses"}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* BEST SELLERS */}
      <section className="border-b border-border">
        <Container size="wide" className="py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.mostPopular}</h2>
              <p className="mt-2 text-muted-foreground">{t.home.mostPopularBlurb}</p>
            </div>
            <Link href="/catalog" className="text-sm font-medium text-brand hover:underline">
              {t.home.viewAll}
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c) => (
              <CourseCard key={c.code} course={c} />
            ))}
          </div>
        </Container>
      </section>

      {/* NOTRE RÉSEAU */}
      <NetworkMap />

      {/* TESTIMONIALS */}
      <section className="border-b border-border bg-muted/30">
        <Container size="wide" className="py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.testimonials}</h2>
          <p className="mt-2 text-muted-foreground">{t.home.testimonialsBlurb}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((tt) => (
              <figure key={tt.name} className="rounded-2xl border border-border bg-card p-6">
                <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" className="text-brand" fill="currentColor">
                  <path d="M9.17 6C5.7 7.83 3 11.5 3 16h6V6H9.17zm12 0c-3.47 1.83-6.17 5.5-6.17 10h6V6h.17z" />
                </svg>
                <blockquote className="mt-3 text-sm leading-relaxed text-fg">&ldquo;{tt.quote}&rdquo;</blockquote>
                <figcaption className="mt-4">
                  <p className="text-sm font-semibold">{tt.name}</p>
                  <p className="text-xs text-muted-foreground">{tt.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* PARTNERS CAROUSEL */}
      <PartnersCarousel />

      {/* FINAL CTA */}
      <section>
        <Container size="wide" className="py-16">
          <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand to-brand-700 p-10 text-brand-foreground">
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">{t.home.ctaTitle}</h2>
                <p className="mt-2 text-sm text-brand-foreground/80">{t.home.ctaBody}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                <Link
                  href="/auth/register"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-brand hover:bg-white/90"
                >
                  {t.home.createFreeAccount}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/40 px-6 text-sm font-semibold text-white hover:bg-white/10"
                >
                  {t.home.talkToUs}
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
