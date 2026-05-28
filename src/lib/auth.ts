import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDb } from "./db";
import { User, type UserRole } from "@/src/models";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      walletCoins: number;
    };
  }
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    walletCoins: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: UserRole;
    walletCoins: number;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDb();
        const u = await User.findOne({ email: credentials.email.toLowerCase().trim() }).select(
          "+passwordHash",
        );
        if (!u) return null;
        if (u.status === "disabled" || u.status === "banned") return null;
        const ok = await bcrypt.compare(credentials.password, u.passwordHash);
        if (!ok) return null;
        // Fire-and-forget last login update.
        User.updateOne({ _id: u._id }, { $set: { lastLoginAt: new Date() } }).catch(() => {});
        return {
          id: String(u._id),
          email: u.email,
          name: `${u.firstName} ${u.surname}`,
          role: u.role as UserRole,
          walletCoins: u.walletCoins ?? 0,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.walletCoins = user.walletCoins;
        token.name = user.name ?? null;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.role = token.role;
        session.user.walletCoins = token.walletCoins;
      }
      return session;
    },
  },
};

export function defaultLandingForRole(role: UserRole): string {
  if (role === "super_admin") return "/super-admin";
  if (role === "admin") return "/admin";
  if (role === "user") return "/dashboard";
  return "/";
}
