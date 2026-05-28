import type { MetadataRoute } from "next";
import { courses as seedCourses } from "@/src/data/seed";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL ?? "https://advancia-platform.vercel.app";
  const now = new Date();
  const staticRoutes = [
    "",
    "/about",
    "/catalog",
    "/calendrier",
    "/contact",
    "/games",
    "/leaderboard",
    "/auth/login",
    "/auth/register",
  ].map((p) => ({ url: `${base}${p}`, lastModified: now }));

  const courseRoutes = seedCourses.map((c) => ({
    url: `${base}/catalog/${encodeURIComponent(c.code)}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...courseRoutes];
}
