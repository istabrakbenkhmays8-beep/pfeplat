import Link from "next/link";
import { Container } from "@/components/layout/Container";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Container size="narrow" className="py-16">
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to keep learning.</p>
        <form className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" />
          </div>
          <button
            type="submit"
            disabled
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-brand text-sm font-medium text-brand-foreground opacity-60"
          >
            Sign in (coming soon)
          </button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          New here? <Link href="/auth/register" className="font-medium text-fg hover:underline">Create an account</Link>
        </p>
      </div>
    </Container>
  );
}
