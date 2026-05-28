import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.freepik.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
    ],
  },
  // Friendly aliases for URLs users commonly guess.
  // NOTE: `/calendar` is intentionally NOT redirected — it's the authenticated
  // user-side calendar (app/(user)/calendar/page.tsx). The public marketing
  // calendar lives at `/calendrier`.
  async redirects() {
    return [
      { source: "/login", destination: "/auth/login", permanent: false },
      { source: "/register", destination: "/auth/register", permanent: false },
      { source: "/signup", destination: "/auth/register", permanent: false },
      { source: "/sign-in", destination: "/auth/login", permanent: false },
      { source: "/forgot-password", destination: "/auth/forgot", permanent: false },
      { source: "/reset-password", destination: "/auth/forgot", permanent: false },
    ];
  },
};

export default nextConfig;
