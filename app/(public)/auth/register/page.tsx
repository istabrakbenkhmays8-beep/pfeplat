import Link from "next/link";
import { Container } from "@/components/layout/Container";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <Container size="narrow" className="py-16">
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Free to start. Pay only for the courses you take.</p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="text-sm font-medium">First name</label>
            <input id="firstName" name="firstName" className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" />
          </div>
          <div>
            <label htmlFor="surname" className="text-sm font-medium">Surname</label>
            <input id="surname" name="surname" className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" />
          </div>
          <button
            type="submit"
            disabled
            className="sm:col-span-2 inline-flex h-10 items-center justify-center rounded-md bg-brand text-sm font-medium text-brand-foreground opacity-60"
          >
            Create account (coming soon)
          </button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account? <Link href="/auth/login" className="font-medium text-fg hover:underline">Sign in</Link>
        </p>
      </div>
    </Container>
  );
}
