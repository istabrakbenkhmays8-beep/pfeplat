import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // No-op — authorization decided in the callback below.
    return undefined;
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        const role = token?.role as string | undefined;

        if (pathname.startsWith("/super-admin")) return role === "super_admin";
        if (pathname.startsWith("/admin")) return role === "admin" || role === "super_admin";
        // Any authenticated user can hit the learner space.
        return Boolean(token);
      },
    },
    pages: { signIn: "/auth/login" },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-courses/:path*",
    "/wallet/:path*",
    "/certificates/:path*",
    "/calendar/:path*",
    "/checkout/:path*",
    "/assessment/:path*",
    "/game/:path*",
    "/profile",
    "/profile/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
    "/post-login",
  ],
};
