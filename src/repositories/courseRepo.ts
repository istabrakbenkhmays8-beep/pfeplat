import { connectDb } from "@/lib/db";
import { Category, Course, Session } from "@/src/models";

export type CatalogFilters = {
  q?: string;
  vendor?: string | "all";
  group?: string | "all";
};

export type CatalogCourse = {
  code: string;
  title: string;
  summary?: string;
  durationDays: number;
  priceTnd: number;
  coinReward: number;
  isFeatured: boolean;
  category: { slug: string; name: string; vendor: string; group: string };
  nextSession?: { startsAt: string; endsAt: string };
};

async function withNextSession(course: any): Promise<CatalogCourse> {
  const next = await Session.findOne({ course: course._id, startsAt: { $gte: new Date() } })
    .sort({ startsAt: 1 })
    .lean<{ startsAt: Date; endsAt: Date } | null>();
  return {
    code: course.code,
    title: course.title,
    summary: course.summary,
    durationDays: course.durationDays,
    priceTnd: course.priceTnd ?? 0,
    coinReward: course.coinReward ?? 0,
    isFeatured: course.isFeatured,
    category: {
      slug: course.category.slug,
      name: course.category.name,
      vendor: course.category.vendor,
      group: course.category.group,
    },
    nextSession: next
      ? { startsAt: next.startsAt.toISOString(), endsAt: next.endsAt.toISOString() }
      : undefined,
  };
}

export async function searchCatalog({ q, vendor, group }: CatalogFilters): Promise<CatalogCourse[]> {
  await connectDb();

  const catFilter: Record<string, unknown> = {};
  if (vendor && vendor !== "all") catFilter.vendor = vendor;
  if (group && group !== "all") catFilter.group = group;
  const catIds = Object.keys(catFilter).length
    ? (await Category.find(catFilter).select("_id").lean()).map((c) => c._id)
    : null;

  const filter: Record<string, unknown> = { isPublished: true };
  if (catIds) filter.category = { $in: catIds };
  if (q && q.trim().length > 0) {
    const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { code: rx }, { summary: rx }];
  }

  const courses = await Course.find(filter).populate("category").sort({ isFeatured: -1, code: 1 }).lean();
  return Promise.all(courses.map(withNextSession));
}

export async function getCourseByCode(code: string): Promise<CatalogCourse | null> {
  await connectDb();
  const course = await Course.findOne({ code: code.toUpperCase(), isPublished: true })
    .populate("category")
    .lean();
  if (!course) return null;
  return withNextSession(course);
}

export async function listAllCourseCodes(): Promise<string[]> {
  await connectDb();
  return (await Course.find({ isPublished: true }).select("code").lean()).map((c) => c.code);
}

export async function listVendors(): Promise<string[]> {
  await connectDb();
  return Category.distinct("vendor");
}

export async function listGroups(): Promise<string[]> {
  await connectDb();
  return Category.distinct("group");
}

export async function countByVendor(): Promise<Array<{ vendor: string; count: number }>> {
  await connectDb();
  const rows = await Course.aggregate([
    { $match: { isPublished: true } },
    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" } },
    { $unwind: "$cat" },
    { $group: { _id: "$cat.vendor", count: { $sum: 1 } } },
    { $project: { _id: 0, vendor: "$_id", count: 1 } },
    { $sort: { count: -1 } },
  ]);
  return rows;
}

export async function countByGroup(): Promise<Array<{ group: string; count: number }>> {
  await connectDb();
  const rows = await Course.aggregate([
    { $match: { isPublished: true } },
    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" } },
    { $unwind: "$cat" },
    { $group: { _id: "$cat.group", count: { $sum: 1 } } },
    { $project: { _id: 0, group: "$_id", count: 1 } },
    { $sort: { count: -1 } },
  ]);
  return rows;
}

export async function getFeaturedCourses(limit = 8): Promise<CatalogCourse[]> {
  await connectDb();
  const courses = await Course.find({ isPublished: true, isFeatured: true })
    .populate("category")
    .sort({ code: 1 })
    .limit(limit)
    .lean();
  return Promise.all(courses.map(withNextSession));
}

export async function getUpcomingSessionsGroupedByWeek() {
  await connectDb();
  const sessions = await Session.find({})
    .populate({ path: "course", populate: "category" })
    .sort({ startsAt: 1 })
    .lean();

  const buckets = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const d = new Date(s.startsAt as unknown as Date);
    const day = d.getUTCDate();
    const week =
      day <= 7 ? "Week 1 · June 1–7" :
      day <= 14 ? "Week 2 · June 8–14" :
      day <= 21 ? "Week 3 · June 15–21" :
      "Week 4 · June 22–30";
    if (!buckets.has(week)) buckets.set(week, []);
    buckets.get(week)!.push(s);
  }
  return Array.from(buckets.entries());
}

export async function headlineStats() {
  await connectDb();
  const [courses, vendors, domains] = await Promise.all([
    Course.countDocuments({ isPublished: true }),
    Category.distinct("vendor"),
    Category.distinct("group"),
  ]);
  return {
    courses,
    vendors: vendors.length,
    domains: domains.length,
    yearsOfExperience: 30,
  };
}
