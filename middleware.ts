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
        if (pathname.startsWith("/dashboard")) return Boolean(token);
        if (pathname.startsWith("/post-login")) return Boolean(token);

        return true;
      },
    },
    pages: { signIn: "/auth/login" },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
    "/post-login",
  ],
};
