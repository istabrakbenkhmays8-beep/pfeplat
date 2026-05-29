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
      </div>
    </Container>
  );
}
