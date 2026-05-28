import { redirect } from "next/navigation";
import { defaultLandingForRole } from "@/lib/auth";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PostLoginRedirect() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  redirect(defaultLandingForRole(session.user.role));
}
