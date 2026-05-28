import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <Container size="narrow" className="py-16">
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free to start. Pay only for the courses you take.
        </p>
        <RegisterForm />
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-fg hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Container>
  );
}
