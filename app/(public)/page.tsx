import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { domainImageFor } from "@/lib/domainImage";
import { KpiCard } from "@/components/ui/KpiCard";
import { CourseCard } from "@/components/cards/CourseCard";
import { VideoHero } from "@/components/home/VideoHero";
import { LearningFormats } from "@/components/home/LearningFormats";
import { NetworkMap } from "@/components/home/NetworkMap";
import { PartnersCarousel } from "@/components/home/PartnersCarousel";
import { ZelligeDivider } from "@/components/ui/ZelligeDivider";
import { Reveal } from "@/components/ui/Reveal";
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
      "I joined Advancia straight after my engineering degree. The PMP track gave me a real edge — I passed on first attempt and landed my first lead role two months later.",
    name: "Mahdi",
    role: "PM · PMP alumni",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&q=80&auto=format&fit=crop&crop=faces",
  },
  {
    quote:
      "I took the AZ-104 with Ada and the trainer was simply brilliant. The hands-on labs felt exactly like work — I walked into my interview confident.",
    name: "Istabrak",
    role: "Cloud engineer · AZ-104 alumni",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&q=80&auto=format&fit=crop&crop=faces",
  },
  {
    quote:
      "Best ROI we've had on training in years. Our SOC team is operational on day one after the bootcamp.",
    name: "Sarra K.",
    role: "CISO · Banking sector",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&q=80&auto=format&fit=crop&crop=faces",
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
      <ZelligeDivider />

      {/* LES CHIFFRES */}
      <section className="border-b border-border">
        <Container size="wide" className="py-14">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.byTheNumbers}</h2>
            <p className="mt-2 text-muted-foreground">{t.home.byTheNumbersBlurb}</p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Reveal delay={0.05}><KpiCard value={`${stats.yearsOfExperience}+`} label={t.home.yearsExpertise} hint={t.home.yearsExpertiseHint} /></Reveal>
            <Reveal delay={0.15}><KpiCard value={`${stats.courses}+`} label={t.home.coursesAvailable} hint={t.home.coursesAvailableHint} /></Reveal>
            <Reveal delay={0.25}><KpiCard value={`${stats.vendors}`} label={t.home.authorizedPartners} hint={t.home.authorizedPartnersHint} /></Reveal>
            <Reveal delay={0.35}><KpiCard value={`${stats.domains}`} label={t.home.competencyDomains} hint={t.home.competencyDomainsHint} /></Reveal>
          </div>
        </Container>
      </section>

      {/* LEARNING FORMATS — official-site styling */}
      <LearningFormats />

      {/* BROWSE BY VENDOR */}
      <section className="border-b border-border">
        <Container size="wide" className="py-16">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.browseByPartner}</h2>
                <p className="mt-2 text-muted-foreground">{t.home.browseByPartnerBlurb}</p>
              </div>
              <Link href="/catalog" className="text-sm font-medium text-brand hover:underline">
                {t.home.seeAllCourses}
              </Link>
            </div>
          </Reveal>
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
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.browseByDomain}</h2>
                <p className="mt-2 text-muted-foreground">{t.home.browseByDomainBlurb}</p>
              </div>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groups.map((g) => (
              <Link
                key={g.group}
                href={`/catalog?group=${encodeURIComponent(g.group)}`}
                className="group relative aspect-[5/3] overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
              >
                <Image
                  src={domainImageFor(g.group, 600)}
                  alt=""
                  fill
                  sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                  <p className="text-lg font-bold leading-tight">{g.group}</p>
                  <p className="text-xs text-white/80">
                    {g.count} {g.count === 1 ? "course" : "courses"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* BEST SELLERS */}
      <section className="border-b border-border">
        <Container size="wide" className="py-16">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.mostPopular}</h2>
                <p className="mt-2 text-muted-foreground">{t.home.mostPopularBlurb}</p>
              </div>
              <Link href="/catalog" className="text-sm font-medium text-brand hover:underline">
                {t.home.viewAll}
              </Link>
            </div>
          </Reveal>
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
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.testimonials}</h2>
            <p className="mt-2 text-muted-foreground">{t.home.testimonialsBlurb}</p>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((tt) => (
              <figure key={tt.name} className="rounded-2xl border border-border bg-card p-6">
                <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" className="text-brand" fill="currentColor">
                  <path d="M9.17 6C5.7 7.83 3 11.5 3 16h6V6H9.17zm12 0c-3.47 1.83-6.17 5.5-6.17 10h6V6h.17z" />
                </svg>
                <blockquote className="mt-3 text-sm leading-relaxed text-fg">&ldquo;{tt.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-brand/30">
                    <Image src={tt.avatar} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span>
                    <p className="text-sm font-semibold">{tt.name}</p>
                    <p className="text-xs text-muted-foreground">{tt.role}</p>
                  </span>
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
