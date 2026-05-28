import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60rem 30rem at 80% -10%, color-mix(in oklab, var(--color-brand) 25%, transparent), transparent), radial-gradient(40rem 20rem at -10% 30%, color-mix(in oklab, var(--color-brand) 12%, transparent), transparent)",
          }}
        />
        <Container size="wide" className="py-16 sm:py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                Online · On-site · Certified
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Learn skills that change your career.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                Online and on-site training, with real certificates and rewards as you progress.
                Built for everyone — no jargon, just clear learning.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/catalog"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-brand px-6 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
                >
                  Browse courses
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-surface px-6 text-sm font-semibold text-fg hover:bg-muted"
                >
                  Create a free account
                </Link>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
                {[
                  { k: "120+", v: "Courses" },
                  { k: "30+", v: "Trainers" },
                  { k: "10k+", v: "Learners" },
                ].map((s) => (
                  <div key={s.v}>
                    <dt className="text-2xl font-bold">{s.k}</dt>
                    <dd className="text-sm text-muted-foreground">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="aspect-video w-full rounded-lg bg-muted" aria-hidden />
                <p className="mt-4 font-semibold">What you’ll get</p>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>· Live online sessions or on-site classes</li>
                  <li>· Coins you earn while learning</li>
                  <li>· A certificate when you finish</li>
                  <li>· Help in English, French, and Arabic</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-border">
        <Container size="wide" className="py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Popular categories</h2>
          <p className="mt-2 text-muted-foreground">Pick a topic and start today.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Tech", "Business", "Design", "Languages"].map((c) => (
              <div key={c} className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-3 h-10 w-10 rounded-md bg-brand/10" aria-hidden />
                <p className="font-semibold">{c}</p>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
