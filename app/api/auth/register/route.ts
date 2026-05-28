import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { User } from "@/src/models";

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

  return Response.json({ id: String(u._id), email: u.email }, { status: 201 });
}
