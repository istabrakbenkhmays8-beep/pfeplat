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
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Required"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm({
  callbackUrl,
  initialError,
}: {
  callbackUrl?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(
    initialError ? humanizeError(initialError) : null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl: callbackUrl || "/",
    });
    if (!res?.ok) {
      setServerError("Wrong email or password.");
      toast.error("Sign-in failed");
      return;
    }
    toast.success("Welcome back!");
    // Let the server decide the destination based on role.
    const target = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/post-login";
    router.push(target);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
      </div>

      {serverError && (
        <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {serverError}
        </p>
      )}

      <p className="text-end text-xs">
        <a href="/auth/forgot" className="font-medium text-brand hover:underline">
          Forgot password?
        </a>
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-medium text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
      >
        {isSubmitting && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
        Sign in
      </button>
    </form>
  );
}

function humanizeError(code: string): string {
  switch (code) {
    case "CredentialsSignin":
      return "Wrong email or password.";
    case "SessionRequired":
      return "Please sign in to continue.";
    default:
      return "Something went wrong. Please try again.";
  }
}
