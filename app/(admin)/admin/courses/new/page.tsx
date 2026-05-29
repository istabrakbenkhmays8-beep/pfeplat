import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCourseFormData } from "@/src/services/courseService";
import { CourseForm } from "@/components/admin/CourseForm";

export const metadata = { title: "New course" };
export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const { categories } = await getCourseFormData();
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">New course</h1>
        <p className="text-sm text-muted-foreground">Add a course to the catalog.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <CourseForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
