import { Container } from "@/components/layout/Container";

export const metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <Container size="default" className="py-10">
      <h1 className="text-3xl font-bold tracking-tight">Contact us</h1>
      <p className="mt-2 text-muted-foreground">We usually reply within one business day.</p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Advancia Training</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            <li>Tunis, Tunisia</li>
            <li>contact@advancia.tn</li>
            <li>+216 00 000 000</li>
          </ul>
        </div>
        <form className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">Your name</label>
            <input id="name" name="name" required className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" required className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" />
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
      </div>
    </Container>
  );
}
