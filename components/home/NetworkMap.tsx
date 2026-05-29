import { geoPath, geoNaturalEarth1 } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import { Container } from "@/components/layout/Container";
import { getT } from "@/src/i18n/server";

// Minimal TopoJSON-ish shape — enough for topojson-client.feature() to accept.
type AnyTopology = {
  type: "Topology";
  objects: Record<string, { type: string } & Record<string, unknown>>;
  arcs: number[][][];
  transform?: { scale: [number, number]; translate: [number, number] };
};

type Office = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  isHQ?: boolean;
};

const OFFICES: Office[] = [
  { city: "Tunis", country: "Tunisia", lat: 36.81, lng: 10.18, isHQ: true },
  { city: "Casablanca", country: "Morocco", lat: 33.57, lng: -7.59 },
  { city: "Aix-en-Provence", country: "France", lat: 43.53, lng: 5.45 },
  { city: "Abidjan", country: "Côte d'Ivoire", lat: 5.32, lng: -4.03 },
];

/** Pre-compute paths + pin positions at module load — cheap, runs once. */
const WIDTH = 1000;
const HEIGHT = 500;
const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], { type: "Sphere" });
const path = geoPath(projection);

const topo = worldAtlas as unknown as AnyTopology;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countriesFc = feature(topo as any, topo.objects.countries as any) as unknown as
  | GeoJSON.FeatureCollection<GeoJSON.MultiPolygon | GeoJSON.Polygon>;

const countryPaths = countriesFc.features
  .map((f) => path(f))
  .filter((d): d is string => !!d);

const sphereD = path({ type: "Sphere" });

const pinPositions = OFFICES.map((o) => {
  const xy = projection([o.lng, o.lat]);
  return xy ? { ...o, x: xy[0], y: xy[1] } : null;
}).filter((p): p is Office & { x: number; y: number } => !!p);

export async function NetworkMap() {
  const { t } = await getT();
  return (
    <section className="relative overflow-hidden border-y border-border bg-neutral-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-50"
        style={{
          background:
            "radial-gradient(40rem 30rem at 70% 30%, color-mix(in oklab, var(--color-brand) 30%, transparent), transparent)",
        }}
      />

      <Container size="wide" className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
            {t.network.sectionLabel}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{t.network.title}</h2>
        </div>

        <div className="mt-10 mx-auto max-w-6xl rounded-2xl border border-white/10 bg-neutral-900 p-4 sm:p-6">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block h-auto w-full"
            role="img"
            aria-label="World map showing Advancia Training offices"
          >
            {sphereD && <path d={sphereD} fill="#101013" stroke="#1f2027" strokeWidth={1} />}
            {countryPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="#1d1d22"
                stroke="#2a2a31"
                strokeWidth={0.6}
                strokeLinejoin="round"
              />
            ))}
            {pinPositions.map((p) => (
              <g key={p.country} transform={`translate(${p.x} ${p.y})`}>
                <circle r="14" fill="#E30613" opacity="0.18">
                  <animate attributeName="r" values="6;18;6" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle r="6" fill="#E30613" stroke="#ffffff" strokeWidth={2} />
                {p.isHQ && <circle r="2" fill="#ffffff" />}
                <text
                  x={10}
                  y={-8}
                  fill="#ffffff"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize={13}
                  fontWeight={600}
                >
                  {p.city}
                </text>
              </g>
            ))}
          </svg>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {OFFICES.map((o) => (
              <li
                key={o.country}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand" />
                <div>
                  <p className="text-sm font-semibold">
                    {o.country}
                    {o.isHQ && <span className="ms-2 rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-medium text-brand">HQ</span>}
                  </p>
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
