import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { Category, Course } from "@/src/models";
import type { CourseInput } from "@/lib/validators/courseSchema";

export async function createCourse(input: CourseInput) {
  await connectDb();
  const cat = await Category.findOne({ slug: input.categorySlug }).select("_id");
  if (!cat) return { ok: false as const, error: "CategoryNotFound" as const };
  const exists = await Course.findOne({ code: input.code }).select("_id");
  if (exists) return { ok: false as const, error: "CodeInUse" as const };
  const c = await Course.create({
    code: input.code,
    title: input.title,
    summary: input.summary || `Official ${input.title} training and certification preparation.`,
    durationDays: input.durationDays,
    category: cat._id,
    modes: input.modes,
    level: input.level,
    priceTnd: input.priceTnd,
    coinReward: input.coinReward,
    isFeatured: input.isFeatured,
    isPublished: input.isPublished,
  });
  return { ok: true as const, id: String(c._id), code: c.code };
}

export async function updateCourse(id: string, input: CourseInput) {
  await connectDb();
  const cat = await Category.findOne({ slug: input.categorySlug }).select("_id");
  if (!cat) return { ok: false as const, error: "CategoryNotFound" as const };
  // Check that no OTHER course already owns this code (case-insensitive via uppercase index)
  const dup = await Course.findOne({ code: input.code, _id: { $ne: new Types.ObjectId(id) } }).select("_id");
  if (dup) return { ok: false as const, error: "CodeInUse" as const };
  const c = await Course.findByIdAndUpdate(
    new Types.ObjectId(id),
    {
      $set: {
        code: input.code,
        title: input.title,
        summary: input.summary,
        durationDays: input.durationDays,
        category: cat._id,
        modes: input.modes,
        level: input.level,
        priceTnd: input.priceTnd,
        coinReward: input.coinReward,
        isFeatured: input.isFeatured,
        isPublished: input.isPublished,
      },
    },
    { new: true },
  );
  if (!c) return { ok: false as const, error: "CourseNotFound" as const };
  return { ok: true as const, id: String(c._id), code: c.code };
}

export async function deleteCourse(id: string) {
  await connectDb();
  // Soft delete: unpublish instead of removing — preserves enrollments/sessions.
  const c = await Course.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: { isPublished: false } },
    { new: true },
  );
  if (!c) return { ok: false as const, error: "CourseNotFound" as const };
  return { ok: true as const };
}

export async function getCourseFormData() {
  await connectDb();
  const categories = await Category.find({}).sort({ vendor: 1, name: 1 }).lean<any[]>();
  return {
    categories: categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      vendor: c.vendor,
      group: c.group,
    })),
  };
}
