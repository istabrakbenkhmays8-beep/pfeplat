import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Check, GraduationCap, Monitor, Users } from "lucide-react";
import { getT } from "@/src/i18n/server";

export async function LearningFormats() {
  const { t } = await getT();

  const cards = [
    {
      title: t.learning.onsiteTitle,
      bullets: t.learning.onsiteBullets,
      icon: GraduationCap,
      filled: false,
    },
    {
      title: t.learning.remoteTitle,
      bullets: t.learning.remoteBullets,
      icon: Monitor,
      filled: true, // centre card emphasis like the official site
    },
    {
      title: t.learning.corporateTitle,
      bullets: t.learning.corporateBullets,
      icon: Users,
      filled: false,
    },
  ];

  return (
    <section className="bg-muted/30">
      <Container size="wide" className="py-16 sm:py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight text-brand sm:text-3xl">
          {t.learning.sectionTitle}
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.title}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex justify-center">
                <div
                  className={
                    c.filled
                      ? "flex h-24 w-24 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg"
                      : "flex h-24 w-24 items-center justify-center rounded-full bg-muted text-fg"
                  }
                  aria-hidden
                >
                  <c.icon className="h-10 w-10" />
                </div>
              </div>
              <h3 className="mt-5 text-center text-lg font-bold uppercase tracking-wide">
                {c.title}
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {c.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-center pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex h-10 items-center rounded-md bg-brand px-6 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
                >
                  {t.learning.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
