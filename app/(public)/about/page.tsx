import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { KpiCard } from "@/components/ui/KpiCard";
import { headlineStats } from "@/src/repositories/courseRepo";

export const metadata = { title: "About us" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const stats = await headlineStats();
  return (
    <>
      <section className="border-b border-border">
        <Container size="wide" className="py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
              Qui sommes-nous
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Leader in IT certification training across North &amp; West Africa.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              For over 30 years, Advancia Training has been helping IT professionals master
              cutting-edge technologies and earn the certifications that move careers forward.
              We are an authorized training partner of the world&apos;s biggest vendors and a
              recognized exam centre.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard value={`${stats.yearsOfExperience}+`} label="Years of expertise" />
            <KpiCard value={`${stats.courses}+`} label="Active courses" />
            <KpiCard value="4" label="Countries" hint="Tunisia · Morocco · France · Côte d'Ivoire" />
            <KpiCard value="15+" label="Authorized partners" />
          </div>
        </Container>
      </section>

      <section className="border-b border-border">
        <Container size="wide" className="py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What makes us different</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Authorized training only",
                body: "All our trainers are certified by the official vendor. Courseware, labs and exams are the real thing — not third-party knockoffs.",
              },
              {
                title: "Hands-on by default",
                body: "Every course pairs theory with real labs you can use the next day at work. Lab environments stay available after class.",
              },
              {
                title: "From beginner to expert",
                body: "We have tracks for first-time learners and bridges to expert-level certifications. We&apos;ll help you pick the right step.",
              },
              {
                title: "Multilingual",
                body: "We deliver in French, English and Arabic. Materials and exams available in multiple languages depending on the vendor.",
              },
              {
                title: "Pass-rate focused",
                body: "Our learners pass certification exams at well-above-industry-average rates. We measure and report what matters.",
              },
              {
                title: "Corporate ready",
                body: "We design custom programs for teams, from a single skill upgrade to a multi-year transformation plan.",
              },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container size="wide" className="py-16">
          <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand to-brand-700 p-10 text-brand-foreground">
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">Want to train your team?</h2>
                <p className="mt-2 text-sm text-brand-foreground/80">
                  Tell us your goals and we&apos;ll design a program that fits your timeline and budget.
                </p>
              </div>
              <div className="flex md:justify-end">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-brand hover:bg-white/90"
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
