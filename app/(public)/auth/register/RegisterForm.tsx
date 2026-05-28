"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const schema = z.object({
  firstName: z.string().trim().min(1, "Required").max(80),
  surname: z.string().trim().min(1, "Required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setServerError("An account with this email already exists.");
      } else if (body?.error === "ValidationError") {
        setServerError("Please check the fields and try again.");
      } else {
        setServerError("Could not create your account. Please try again.");
      }
      toast.error("Sign-up failed");
      return;
    }

    toast.success("Account created — signing you in…");
    const signin = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (signin?.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      router.push("/auth/login");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
        <input
          id="firstName"
          autoComplete="given-name"
          {...register("firstName")}
          className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </Field>
      <Field label="Surname" htmlFor="surname" error={errors.surname?.message}>
        <input
          id="surname"
          autoComplete="family-name"
          {...register("surname")}
          className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email?.message} className="sm:col-span-2">
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password?.message} className="sm:col-span-2">
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </Field>

      {serverError && (
        <p className="sm:col-span-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="sm:col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand text-sm font-medium text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
      >
        {isSubmitting && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
        Create account
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
