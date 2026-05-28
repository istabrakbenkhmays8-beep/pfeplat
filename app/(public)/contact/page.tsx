import { Container } from "@/components/layout/Container";

export const metadata = { title: "Contact us" };

type Office = {
  country: string;
  flag: string;
  address: string[];
  email: string;
  phone: string;
};

const offices: Office[] = [
  {
    country: "Tunisia (Head Office)",
    flag: "🇹🇳",
    address: ["Immeuble GlobalNet", "53 Rue des Minéraux", "Charguia 1, Tunis"],
    email: "service-clients@advancia-training.com",
    phone: "+216 70 014 078",
  },
  {
    country: "Morocco",
    flag: "🇲🇦",
    address: ["Bureau 402, Zenith Millenium Immeuble 1", "20190 Sidi Maarouf, Casablanca"],
    email: "info.maroc@advancia-training.com",
    phone: "+212 0522 78 98 26",
  },
  {
    country: "France",
    flag: "🇫🇷",
    address: ["190 rue Topaze", "Éguilles Aix-en-Provence 13510"],
    email: "info.france@advancia-training.com",
    phone: "+33 4-24191444",
  },
  {
    country: "Côte d'Ivoire",
    flag: "🇨🇮",
    address: ["Avenue Dr. Crozet", "Immeuble XL, 7ème étage", "Plateau Abidjan"],
    email: "info.ci@advancia-training.com",
    phone: "+225 20 30 92 41",
  },
];

export default function ContactPage() {
  return (
    <Container size="wide" className="py-12">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact us</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Reach out to any of our offices, or send a message and we&apos;ll get back to you within one business day.
        </p>
      </header>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        {offices.map((o) => (
          <article key={o.country} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-2xl leading-none">{o.flag}</span>
              <h2 className="text-lg font-semibold">{o.country}</h2>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {o.address.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="w-16 text-muted-foreground">Phone</dt>
                <dd>{o.phone}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 text-muted-foreground">Email</dt>
                <dd>
                  <a href={`mailto:${o.email}`} className="text-fg hover:underline">{o.email}</a>
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold">Send us a message</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us what you&apos;d like to learn or which course you&apos;re interested in. We&apos;ll suggest the best path for you.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            You can also visit{" "}
            <a href="https://www.advancia-training.com" className="text-fg hover:underline">advancia-training.com</a>{" "}
            to see all our certifications and partner accreditations.
          </p>
        </div>
        <form className="lg:col-span-3 rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="text-sm font-medium">Your name</label>
              <input id="name" name="name" required className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input id="email" name="email" type="email" required className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="subject" className="text-sm font-medium">Subject</label>
            <input id="subject" name="subject" required className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" />
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-medium">Message</label>
            <textarea id="message" name="message" rows={5} required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
          </div>
          <button
            type="submit"
            disabled
            className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-medium text-brand-foreground opacity-60"
          >
            Send (coming soon)
          </button>
        </form>
      </section>
    </Container>
  );
}
