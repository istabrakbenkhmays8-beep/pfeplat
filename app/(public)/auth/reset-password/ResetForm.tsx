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
  password: z.string().min(8, "At least 8 characters"),
  confirm: z.string().min(8, "At least 8 characters"),
}).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

type FormData = z.infer<typeof schema>;

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg =
        body?.error === "TokenExpired"
          ? "This reset link has expired. Request a new one."
          : body?.error === "InvalidToken"
          ? "This reset link is invalid."
          : body?.error === "TokenAlreadyUsed"
          ? "This link has already been used."
          : "Could not reset your password.";
      setServerError(msg);
      toast.error("Reset failed");
      return;
    }
    toast.success("Password updated");
    router.push("/auth/login");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="password" className="text-sm font-medium">New password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
      </div>
      <div>
        <label htmlFor="confirm" className="text-sm font-medium">Confirm password</label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          {...register("confirm")}
          className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        {errors.confirm && <p className="mt-1 text-xs text-danger">{errors.confirm.message}</p>}
      </div>
      {serverError && (
        <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {serverError}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-medium text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Save new password
      </button>
    </form>
  );
}
