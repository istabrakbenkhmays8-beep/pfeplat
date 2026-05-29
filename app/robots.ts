import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? "https://advancia-platform.vercel.app";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/super-admin/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
