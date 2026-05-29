"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

type FormData = z.infer<typeof schema>;
type SubmitResult = {
  previewResetLink?: string;
};

export function ForgotForm() {
  const [result, setResult] = useState<SubmitResult | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const body = (await res.json()) as { previewResetLink?: string };
      setResult({
        previewResetLink: body.previewResetLink,
      });
      toast.success(body.previewResetLink ? "Reset link ready" : "Check your inbox");
    } else {
      toast.error("Something went wrong");
    }
  }

  if (result) {
    return (
      <div className="mt-6 space-y-3">
        <div className="rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          {result.previewResetLink
            ? "Email sending is not set up on this machine yet, so your reset link is ready below."
            : "If this email is on file, we've sent a reset link. It expires in 30 minutes."}
        </div>
        {result.previewResetLink ? (
          <a
            href={result.previewResetLink}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-brand text-sm font-medium text-brand-foreground hover:bg-brand-600"
          >
            Open reset link
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-medium text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Send reset link
      </button>
    </form>
  );
}
