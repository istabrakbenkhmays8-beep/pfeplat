import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { connectDb } from "@/lib/db";
import { Course } from "@/src/models";
import { getCourseFormData } from "@/src/services/courseService";
import { CourseForm } from "@/components/admin/CourseForm";

export const metadata = { title: "Edit course" };
export const dynamic = "force-dynamic";

type RouteParams = Promise<{ code: string }>;

export default async function EditCoursePage({ params }: { params: RouteParams }) {
  const { code } = await params;
  await connectDb();
  const course = await Course.findOne({ code: decodeURIComponent(code).toUpperCase() })
    .populate("category")
    .lean<any>();
  if (!course) notFound();

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
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Edit course <span className="font-mono text-base text-muted-foreground">{course.code}</span>
        </h1>
        <p className="text-sm text-muted-foreground">{course.title}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <CourseForm
          mode="edit"
          courseId={String(course._id)}
          categories={categories}
          initial={{
            code: course.code,
            title: course.title,
            summary: course.summary ?? "",
            categorySlug: course.category?.slug ?? categories[0]?.slug,
            modes: course.modes ?? ["live_online", "on_site"],
            level: course.level ?? "intermediate",
            durationDays: course.durationDays,
            priceTnd: course.priceTnd ?? 0,
            coinReward: course.coinReward ?? 50,
            isFeatured: !!course.isFeatured,
            isPublished: !!course.isPublished,
          }}
        />
      </div>
    </div>
  );
}
