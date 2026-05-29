import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { User } from "@/src/models";
import { sendWelcomeEmail } from "@/src/services/emailTemplates";

export const runtime = "nodejs";

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  surname: z.string().trim().min(1, "Surname is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").max(120),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "ValidationError",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  await connectDb();
  const existing = await User.findOne({ email: parsed.data.email }).lean();
  if (existing) {
    return Response.json({ error: "EmailInUse" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const u = await User.create({
    firstName: parsed.data.firstName,
    surname: parsed.data.surname,
    email: parsed.data.email,
    passwordHash,
    role: "user",
    // Email verification flow will be added in a follow-up; for now: active immediately.
    status: "active",
  });

  let welcomeEmailStatus: "sent" | "not_configured" | "failed" = "not_configured";
  try {
    const mail = await sendWelcomeEmail({ to: u.email, firstName: u.firstName });
    welcomeEmailStatus =
      mail.reason === "transport_error" ? "failed" : mail.delivered ? "sent" : "not_configured";
  } catch (err) {
    welcomeEmailStatus = "failed";
    console.warn("[register] welcome email failed:", err);
  }

  return Response.json(
    {
      id: String(u._id),
      email: u.email,
      welcomeEmailStatus,
    },
    { status: 201 },
  );
}
