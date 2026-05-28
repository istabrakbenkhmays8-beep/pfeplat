import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  return (
    <Container size="narrow" className="py-16">
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to keep learning.</p>
        <LoginForm callbackUrl={sp.callbackUrl} initialError={sp.error} />
        <p className="mt-4 text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/auth/register" className="font-medium text-fg hover:underline">
            Create an account
          </Link>
        </p>

        <details className="mt-6 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-fg">Demo accounts</summary>
          <ul className="mt-2 space-y-1">
            <li>
              <code className="rounded bg-muted px-1">superadmin@advancia-training.com</code> — full access
            </li>
            <li>
              <code className="rounded bg-muted px-1">admin@advancia-training.com</code> — admin
            </li>
            <li>
              <code className="rounded bg-muted px-1">learner@advancia-training.com</code> — regular user
            </li>
            <li>
              Password: <code className="rounded bg-muted px-1">ChangeMe!2026</code>
            </li>
          </ul>
        </details>
      </div>
    </Container>
  );
}
