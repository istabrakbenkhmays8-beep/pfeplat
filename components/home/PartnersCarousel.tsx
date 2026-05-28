import { Container } from "@/components/layout/Container";
import { getT } from "@/src/i18n/server";

const PARTNERS = [
  "Microsoft Gold Partner",
  "Cisco Learning Partner",
  "VMware Authorized",
  "Fortinet Authorized",
  "EC-Council",
  "PECB",
  "PeopleCert",
  "PMI",
  "PaloAlto",
  "IBM",
  "Pearson VUE",
  "PSI",
  "CompTIA",
  "Kaspersky",
];

export async function PartnersCarousel() {
  const { t } = await getT();
  // Duplicate the list so the marquee can loop seamlessly.
  const items = [...PARTNERS, ...PARTNERS];

  return (
    <section id="partners" className="border-y border-border bg-card">
      <Container size="wide" className="py-14">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            {t.partners.sectionLabel}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.partners.title}
          </h2>
        </div>

        <div className="relative mt-10 overflow-hidden">
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-card to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-card to-transparent" />

          <ul className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused] hover:[animation-play-state:paused]">
            {items.map((p, i) => (
              <li
                key={`${p}-${i}`}
                className="flex h-24 w-48 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface px-4 text-center"
              >
                <span className="text-sm font-semibold text-fg/80">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
