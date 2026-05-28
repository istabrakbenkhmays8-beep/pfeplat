import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";
import { getT } from "@/src/i18n/server";

type Office = {
  country: string;
  lines: string[];
  email?: string;
  phone?: string;
};

const offices: Office[] = [
  {
    country: "Tunisia (HQ)",
    lines: ["Immeuble GlobalNet", "53 Rue des Minéraux", "Charguia 1, Tunis"],
    email: "service-clients@advancia-training.com",
    phone: "+216 70 014 078",
  },
  {
    country: "Morocco",
    lines: ["Bureau 402, Zenith Millenium Immeuble 1", "20190 Sidi Maarouf, Casablanca"],
    email: "info.maroc@advancia-training.com",
    phone: "+212 0522 78 98 26",
  },
  {
    country: "France",
    lines: ["190 rue Topaze", "Éguilles Aix-en-Provence 13510"],
    email: "info.france@advancia-training.com",
    phone: "+33 4-24191444",
  },
  {
    country: "Côte d'Ivoire",
    lines: ["Avenue Dr. Crozet", "Immeuble XL, 7ème étage", "Plateau Abidjan"],
    email: "info.ci@advancia-training.com",
    phone: "+225 20 30 92 41",
  },
];

export async function Footer() {
  const year = new Date().getFullYear();
  const { t } = await getT();
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <Container size="wide">
        <div className="grid gap-10 py-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <span className="inline-flex items-center rounded-md px-1 py-0.5 dark:bg-white">
              <Image
                src="/brand/advancia-logo.png"
                alt="Advancia Training"
                width={175}
                height={64}
                className="h-9 w-auto"
              />
            </span>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{t.footer.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {["Microsoft Gold", "Cisco Learning", "Fortinet", "EC-Council", "PECB", "PMI"].map((p) => (
                <span key={p} className="rounded-full border border-border px-2 py-1">{p}</span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold">{t.footer.ourOffices}</h4>
            <div className="grid gap-6 sm:grid-cols-2">
              {offices.map((o) => (
                <div key={o.country}>
                  <p className="text-sm font-semibold">{o.country}</p>
                  <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                    {o.lines.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                    {o.phone && <li className="pt-1">{o.phone}</li>}
                    {o.email && (
                      <li>
                        <a href={`mailto:${o.email}`} className="hover:text-fg">
                          {o.email}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Advancia Training. {t.footer.allRightsReserved}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/catalog" className="hover:text-fg">Courses</Link>
            <Link href="/contact" className="hover:text-fg">Contact</Link>
            <a href="https://www.advancia-training.com" target="_blank" rel="noreferrer" className="hover:text-fg">
              advancia-training.com
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
