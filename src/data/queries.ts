import { categories, courses, type CourseCategory, type CourseSeed, type Vendor } from "./seed";

export type EnrichedCourse = CourseSeed & {
  category: CourseCategory;
};

const enriched: EnrichedCourse[] = courses.map((c) => {
  const cat = categories.find((cat) => cat.slug === c.categorySlug);
  if (!cat) throw new Error(`No category for ${c.code}`);
  return { ...c, category: cat };
});

export function getAllCourses(): EnrichedCourse[] {
  return enriched;
}

export function getCourse(code: string): EnrichedCourse | undefined {
  return enriched.find((c) => c.code.toLowerCase() === code.toLowerCase());
}

export type CatalogFilters = {
  q?: string;
  vendor?: Vendor | "all";
  group?: string | "all";
};

export function searchCourses({ q, vendor, group }: CatalogFilters): EnrichedCourse[] {
  const needle = q?.trim().toLowerCase();
  return enriched.filter((c) => {
    if (vendor && vendor !== "all" && c.category.vendor !== vendor) return false;
    if (group && group !== "all" && c.category.group !== group) return false;
    if (!needle) return true;
    return (
      c.title.toLowerCase().includes(needle) ||
      c.code.toLowerCase().includes(needle) ||
      c.category.name.toLowerCase().includes(needle) ||
      c.category.vendor.toLowerCase().includes(needle) ||
      c.category.group.toLowerCase().includes(needle)
    );
  });
}

export function listVendors(): Vendor[] {
  return Array.from(new Set(categories.map((c) => c.vendor))) as Vendor[];
}

export function listGroups(): string[] {
  return Array.from(new Set(categories.map((c) => c.group)));
}

export function countByVendor(): Array<{ vendor: Vendor; count: number }> {
  const out = new Map<Vendor, number>();
  for (const c of enriched) {
    out.set(c.category.vendor, (out.get(c.category.vendor) ?? 0) + 1);
  }
  return Array.from(out.entries()).map(([vendor, count]) => ({ vendor, count }));
}

export function countByGroup(): Array<{ group: string; count: number }> {
  const out = new Map<string, number>();
  for (const c of enriched) {
    out.set(c.category.group, (out.get(c.category.group) ?? 0) + 1);
  }
  return Array.from(out.entries()).map(([group, count]) => ({ group, count }));
}

/** Best-sellers — matches what advancia-training.com highlights. */
export const featuredCodes = ["AZ-104", "ISO27001LI", "CCNA", "NSE4", "PMP", "AZ-500", "PL-300", "DEVOPS"];

export function getFeaturedCourses(): EnrichedCourse[] {
  return featuredCodes
    .map((code) => enriched.find((c) => c.code === code))
    .filter((c): c is EnrichedCourse => Boolean(c));
}

/** "Les chiffres" — headline KPIs for the home page. */
export const headlineStats = {
  courses: enriched.length,
  vendors: listVendors().length,
  domains: listGroups().length,
  yearsOfExperience: 30,
};

/** Upcoming sessions (sorted by start date). */
export function getUpcomingSessions() {
  return enriched
    .filter((c) => c.juneSession)
    .map((c) => ({
      course: c,
      start: c.juneSession!.start,
      end: c.juneSession!.end,
    }))
    .sort((a, b) => a.start.localeCompare(b.start));
}

/** Group sessions by ISO week within June. */
export function groupSessionsByWeek() {
  const sessions = getUpcomingSessions();
  const buckets = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const day = parseInt(s.start.slice(8, 10), 10);
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

/** Format an ISO date "2026-06-15" as "15 Jun". */
export function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
}

/** Format a session range "15 → 19 Jun". */
export function sessionRange(start: string, end: string): string {
  const a = new Date(start + "T00:00:00Z");
  const b = new Date(end + "T00:00:00Z");
  const sameMonth = a.getUTCMonth() === b.getUTCMonth();
  if (sameMonth) {
    return `${a.toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" })} → ${b.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" })}`;
  }
  return `${shortDate(start)} → ${shortDate(end)}`;
}
