import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SearchBar } from "@/components/ui/SearchBar";
import { KpiCard } from "@/components/ui/KpiCard";
import { CourseCard } from "@/components/cards/CourseCard";
import {
  countByGroup,
  countByVendor,
  getFeaturedCourses,
  headlineStats,
} from "@/src/repositories/courseRepo";
import { getT } from "@/src/i18n/server";

export const dynamic = "force-dynamic";

const learningFormats = [
  {
    title: "On-site classes",
    body: "Train in our centres in Tunis, Casablanca, Aix-en-Provence or Abidjan. Hands-on labs and direct access to certified instructors.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Live online",
    body: "Join real instructor-led sessions from anywhere. Same labs, same certificate, no travel required.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: "Corporate & custom",
    body: "Tailored plans for teams of any size — on your premises or ours, in English, French or Arabic.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

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

  const learningFormatsLocalised = [
    { ...learningFormats[0], title: t.home.onSiteTitle, body: t.home.onSiteBody },
    { ...learningFormats[1], title: t.home.liveOnlineTitle, body: t.home.liveOnlineBody },
    { ...learningFormats[2], title: t.home.corporateTitle, body: t.home.corporateBody },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(80rem 40rem at 90% -20%, color-mix(in oklab, var(--color-brand) 28%, transparent), transparent), radial-gradient(50rem 30rem at -10% 30%, color-mix(in oklab, var(--color-brand) 14%, transparent), transparent)",
          }}
        />
        <Container size="wide" className="py-16 sm:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                {t.home.badge}
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {t.home.heroTitle1}{" "}
                <span className="text-brand">{t.home.heroTitleAccent}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{t.home.heroSubtitle}</p>

              <div className="mt-7 max-w-xl">
                <SearchBar size="lg" placeholder={t.common.searchPlaceholder} />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/catalog"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-brand px-6 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
                >
                  {t.home.browseCourses}
                </Link>
                <Link
                  href="/reference/planning-formation-juin-2026.pdf"
                  target="_blank"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-surface px-6 text-sm font-semibold text-fg hover:bg-muted"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" className="me-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t.home.downloadPlanning}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-border bg-card p-2 shadow-xl">
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand/80 via-brand to-brand-700">
                  <div className="flex h-full items-center justify-center">
                    <button
                      type="button"
                      aria-label="Play introduction video"
                      className="group inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-brand transition hover:scale-105"
                    >
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold">{t.home.watchTour}</p>
                  <p className="text-xs text-muted-foreground">{t.home.watchTourBody}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

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

      {/* LEARNING FORMATS */}
      <section className="border-b border-border">
        <Container size="wide" className="py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.threeWays}</h2>
          <p className="mt-2 text-muted-foreground">{t.home.threeWaysBlurb}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {learningFormatsLocalised.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* BROWSE BY VENDOR */}
      <section className="border-b border-border">
        <Container size="wide" className="py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse by partner</h2>
              <p className="mt-2 text-muted-foreground">Authorized training and exams across the vendors we cover.</p>
            </div>
            <Link href="/catalog" className="text-sm font-medium text-brand hover:underline">
              See all courses →
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
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse by domain</h2>
              <p className="mt-2 text-muted-foreground">From Cloud to Cybersecurity, find the track that matches your goal.</p>
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
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Most popular this month</h2>
              <p className="mt-2 text-muted-foreground">The certifications our learners are taking right now.</p>
            </div>
            <Link href="/catalog" className="text-sm font-medium text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c) => (
              <CourseCard key={c.code} course={c} />
            ))}
          </div>
        </Container>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-b border-border bg-muted/30">
        <Container size="wide" className="py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What our learners say</h2>
          <p className="mt-2 text-muted-foreground">Stories from people who passed their certification with us.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border bg-card p-6">
                <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" className="text-brand" fill="currentColor">
                  <path d="M9.17 6C5.7 7.83 3 11.5 3 16h6V6H9.17zm12 0c-3.47 1.83-6.17 5.5-6.17 10h6V6h.17z" />
                </svg>
                <blockquote className="mt-3 text-sm leading-relaxed text-fg">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* PARTNERS */}
      <section className="border-b border-border">
        <Container size="wide" className="py-14">
          <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Authorized training partner of
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              "Microsoft Gold",
              "Cisco Learning",
              "Fortinet",
              "EC-Council",
              "PECB",
              "PeopleCert",
              "PMI",
              "PaloAlto",
              "IBM",
              "VMware",
              "Kaspersky",
              "CompTIA",
            ].map((p) => (
              <span key={p} className="text-sm font-semibold text-fg/70">{p}</span>
            ))}
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section>
        <Container size="wide" className="py-16">
          <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand to-brand-700 p-10 text-brand-foreground">
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">Ready to take the next step?</h2>
                <p className="mt-2 text-sm text-brand-foreground/80">
                  Create a free account and start your first course today. Earn coins as you learn, and turn them into discounts.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                <Link
                  href="/auth/register"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-brand hover:bg-white/90"
                >
                  Create a free account
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/40 px-6 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
