import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ForgotForm } from "./ForgotForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <Container size="narrow" className="py-16">
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to choose a new password.
        </p>
        <ForgotForm />
        <p className="mt-4 text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/auth/login" className="font-medium text-fg hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </Container>
  );
}
