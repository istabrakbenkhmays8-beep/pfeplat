import { Container } from "@/components/layout/Container";
import { getT } from "@/src/i18n/server";

type Office = {
  name: string;
  city: string;
  country: string;
  /** Approximate lat/lng — used to position the pin over the SVG world map (Equirectangular projection). */
  lat: number;
  lng: number;
};

const OFFICES: Office[] = [
  { name: "HQ", city: "Tunis", country: "Tunisia", lat: 36.81, lng: 10.18 },
  { name: "Maroc", city: "Casablanca", country: "Morocco", lat: 33.57, lng: -7.59 },
  { name: "France", city: "Aix-en-Provence", country: "France", lat: 43.53, lng: 5.45 },
  { name: "Côte d'Ivoire", city: "Abidjan", country: "Côte d'Ivoire", lat: 5.32, lng: -4.03 },
];

/** Convert lat/lng (-90..90, -180..180) into x%/y% on a 2:1 equirectangular map. */
function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

export async function NetworkMap() {
  const { t } = await getT();
  return (
    <section className="relative overflow-hidden border-y border-border bg-neutral-950 text-white">
      {/* Soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-50"
        style={{
          background:
            "radial-gradient(40rem 30rem at 70% 30%, color-mix(in oklab, var(--color-brand) 35%, transparent), transparent)",
        }}
      />

      <Container size="wide" className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
            {t.network.sectionLabel}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{t.network.title}</h2>
        </div>

        <div className="mt-10 mx-auto max-w-6xl">
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
            {/* Subtle dotted world background */}
            <WorldDots />

            {/* Pins */}
            {OFFICES.map((o) => {
              const { x, y } = project(o.lat, o.lng);
              return (
                <div
                  key={o.country}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="relative">
                    {/* Pulse */}
                    <span className="absolute inset-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 animate-ping rounded-full bg-brand/60" />
                    {/* Pin */}
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-brand shadow-md" />
                    <div className="absolute start-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-neutral-900 opacity-0 shadow-lg transition group-hover:opacity-100">
                      {o.city}, {o.country}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Office legend below the map */}
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {OFFICES.map((o) => (
              <li
                key={o.country}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
              >
                <span className="inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand" />
                <div>
                  <p className="text-sm font-semibold">{o.country}</p>
                  <p className="text-xs text-white/70">{o.city}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/** Stylized dotted continents — a small SVG that hints at landmasses without needing a full map asset. */
function WorldDots() {
  // A sparse hand-picked grid of dots that roughly outlines continents on a 2:1 equirectangular plane.
  // x%, y% pairs — adjust freely.
  const dots: Array<[number, number]> = [
    // North America
    [15, 22], [18, 24], [20, 22], [22, 24], [16, 26], [19, 26], [21, 28], [24, 28], [17, 30], [22, 32],
    // Central America
    [21, 38], [24, 40],
    // South America
    [27, 50], [30, 54], [28, 58], [31, 60], [29, 64], [32, 66],
    // Europe
    [48, 22], [50, 24], [52, 22], [54, 24], [48, 26], [51, 26], [50, 28],
    // Africa
    [50, 40], [53, 44], [50, 48], [56, 46], [52, 52], [54, 56], [50, 58], [57, 60], [52, 62],
    // Middle East
    [57, 36], [60, 38], [58, 34],
    // Asia
    [62, 28], [66, 30], [70, 32], [74, 30], [78, 34], [82, 32], [70, 38], [75, 40], [78, 42], [82, 40],
    // SE Asia & Australia
    [82, 50], [85, 56], [88, 64], [86, 66],
  ];
  return (
    <svg viewBox="0 0 100 50" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.45" fill="#ffffff" opacity="0.18" />
      ))}
    </svg>
  );
}
