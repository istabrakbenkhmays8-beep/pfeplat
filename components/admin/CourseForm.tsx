"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2, Trash2 } from "lucide-react";
import { courseInputSchema, type CourseInput } from "@/lib/validators/courseSchema";
import { COURSE_LEVELS, COURSE_MODES } from "@/src/models";

type Mode = "create" | "edit";

type CategoryOption = {
  slug: string;
  name: string;
  vendor: string;
  group: string;
};

export function CourseForm({
  mode,
  initial,
  categories,
  courseId,
}: {
  mode: Mode;
  initial?: Partial<CourseInput>;
  categories: CategoryOption[];
  courseId?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseInputSchema),
    defaultValues: {
      code: "",
      title: "",
      summary: "",
      modes: ["live_online", "on_site"],
      level: "intermediate",
      durationDays: 3,
      priceTnd: 0,
      coinReward: 50,
      isFeatured: false,
      isPublished: true,
      categorySlug: categories[0]?.slug ?? "",
      ...initial,
    },
  });

  async function onSubmit(data: CourseInput) {
    const url = mode === "create" ? "/api/admin/courses" : `/api/admin/courses/${courseId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(
        body?.error === "CodeInUse"
          ? "That course code is already in use."
          : body?.error === "CategoryNotFound"
          ? "Pick a valid category."
          : "Could not save the course.",
      );
      return;
    }
    toast.success(mode === "create" ? "Course created" : "Course updated");
    router.push("/admin/courses");
    router.refresh();
  }

  async function onDelete() {
    if (!courseId) return;
    if (!confirm("Unpublish this course? It will be hidden from the catalog but kept for history.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not unpublish the course.");
        return;
      }
      toast.success("Course unpublished");
      router.push("/admin/courses");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Course code" error={errors.code?.message} htmlFor="code">
          <input
            id="code"
            placeholder="AZ-104"
            {...register("code")}
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm uppercase focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </Field>
        <Field label="Duration (days)" error={errors.durationDays?.message} htmlFor="durationDays">
          <input
            id="durationDays"
            type="number"
            step="0.5"
            min="0.5"
            max="60"
            {...register("durationDays")}
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
          />
        </Field>
      </div>

      <Field label="Title" error={errors.title?.message} htmlFor="title">
        <input
          id="title"
          {...register("title")}
          className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
        />
      </Field>

      <Field label="Short summary" error={errors.summary?.message} htmlFor="summary">
        <textarea
          id="summary"
          rows={3}
          {...register("summary")}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" error={errors.categorySlug?.message} htmlFor="categorySlug">
          <select
            id="categorySlug"
            {...register("categorySlug")}
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.vendor} · {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Level" error={errors.level?.message} htmlFor="level">
          <select
            id="level"
            {...register("level")}
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
          >
            {COURSE_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div>
        <p className="text-sm font-medium">Delivery modes</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {COURSE_MODES.map((m) => (
            <label key={m} className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm">
              <input type="checkbox" value={m} {...register("modes")} className="h-4 w-4 accent-[var(--color-brand)]" />
              {m.replace("_", " ")}
            </label>
          ))}
        </div>
        {errors.modes && <p className="mt-1 text-xs text-danger">Pick at least one mode.</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price (TND)" error={errors.priceTnd?.message} htmlFor="priceTnd">
          <input
            id="priceTnd"
            type="number"
            min="0"
            step="1"
            {...register("priceTnd")}
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
          />
        </Field>
        <Field label="Coin reward on completion" error={errors.coinReward?.message} htmlFor="coinReward">
          <input
            id="coinReward"
            type="number"
            min="0"
            step="1"
            {...register("coinReward")}
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isPublished")} className="h-4 w-4 accent-[var(--color-brand)]" />
          Published (visible in catalog)
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 accent-[var(--color-brand)]" />
          Featured (shows on home page)
        </label>
      </div>

      <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create course" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-danger/40 bg-danger/5 px-4 text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Unpublish course
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
