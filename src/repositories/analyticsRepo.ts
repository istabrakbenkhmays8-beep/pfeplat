import { connectDb } from "@/lib/db";
import { Category, Course, Enrollment } from "@/src/models";

export type WeekPoint = { week: string; enrollments: number; completions: number };
export type VendorPoint = { vendor: string; courses: number };
export type GroupPoint = { group: string; courses: number };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function weekKey(d: Date): string {
  // Monday-aligned ISO-ish week, formatted "DD MMM".
  const day = (d.getUTCDay() + 6) % 7;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - day);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
}

/** Last 8 weeks of enrollment + completion activity. */
export async function enrollmentTrend(): Promise<WeekPoint[]> {
  await connectDb();
  const now = new Date();
  const since = new Date(now.getTime() - 8 * WEEK_MS);

  const rows = await Enrollment.find({ createdAt: { $gte: since } })
    .select("createdAt status completedAt")
    .lean<{ createdAt: Date; status: string; completedAt?: Date }[]>();

  const buckets = new Map<string, WeekPoint>();
  // Pre-seed 8 buckets in chronological order so the chart doesn't have gaps.
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getTime() - i * WEEK_MS);
    const k = weekKey(d);
    if (!buckets.has(k)) buckets.set(k, { week: k, enrollments: 0, completions: 0 });
  }

  for (const r of rows) {
    const k = weekKey(new Date(r.createdAt));
    const b = buckets.get(k);
    if (b) b.enrollments += 1;
    if (r.status === "completed" && r.completedAt) {
      const kc = weekKey(new Date(r.completedAt));
      const bc = buckets.get(kc);
      if (bc) bc.completions += 1;
    }
  }

  return Array.from(buckets.values());
}

export async function coursesByVendor(): Promise<VendorPoint[]> {
  await connectDb();
  const rows = await Course.aggregate([
    { $match: { isPublished: true } },
    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" } },
    { $unwind: "$cat" },
    { $group: { _id: "$cat.vendor", count: { $sum: 1 } } },
    { $project: { _id: 0, vendor: "$_id", courses: "$count" } },
    { $sort: { courses: -1 } },
  ]);
  return rows;
}

export async function coursesByGroup(): Promise<GroupPoint[]> {
  await connectDb();
  const rows = await Course.aggregate([
    { $match: { isPublished: true } },
    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" } },
    { $unwind: "$cat" },
    { $group: { _id: "$cat.group", count: { $sum: 1 } } },
    { $project: { _id: 0, group: "$_id", courses: "$count" } },
    { $sort: { courses: -1 } },
  ]);
  return rows;
}

export async function categoryCount() {
  await connectDb();
  return Category.countDocuments();
}
