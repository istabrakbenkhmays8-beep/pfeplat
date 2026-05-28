import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { Container } from "@/components/layout/Container";
import { requireSession } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { User } from "@/src/models";
import { ProfileForm } from "./ProfileForm";

export const metadata = { title: "My profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();

  await connectDb();
  const u = await User.findById(new Types.ObjectId(session.user.id))
    .select("firstName surname email avatarUrl role country level walletCoins createdAt")
    .lean<{
      _id: unknown;
      firstName: string;
      surname: string;
      email: string;
      avatarUrl?: string;
      role: string;
      country?: string;
      level?: string;
      walletCoins?: number;
      createdAt?: Date;
    } | null>();

  if (!u) redirect("/auth/login");

  const roleLabel =
    u.role === "super_admin" ? "Super admin" : u.role === "admin" ? "Admin" : "Learner";

  return (
    <Container size="default" className="py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your photo, email address, or password. Changes save instantly.
        </p>
      </header>

      <ProfileForm
        initial={{
          firstName: u.firstName,
          surname: u.surname,
          email: u.email,
          avatarUrl: u.avatarUrl ?? "",
          country: u.country ?? "",
          roleLabel,
          walletCoins: u.walletCoins ?? 0,
          memberSince: u.createdAt ? new Date(u.createdAt).toISOString() : null,
        }}
      />
    </Container>
  );
}
