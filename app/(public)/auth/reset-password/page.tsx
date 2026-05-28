import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "Reset password" };

type SearchParams = Promise<{ token?: string }>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;

  return (
    <Container size="narrow" className="py-16">
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Choose a new password</h1>
        {!token ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              This link is missing the reset token. Please use the most recent email we sent you, or request a new one.
            </p>
            <Link
              href="/auth/forgot"
              className="mt-4 inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick something at least 8 characters long. We&apos;ll sign you in afterwards.
            </p>
            <ResetForm token={token} />
          </>
        )}
      </div>
    </Container>
  );
}
