import { requireRole } from "@/lib/session";
import { trainerInputSchema } from "@/lib/validators/trainerSchema";
import { createTrainer } from "@/src/services/trainerService";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await requireRole("super_admin");
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = trainerInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "ValidationError", issues: parsed.error.flatten() }, { status: 400 });
  }
  const r = await createTrainer(parsed.data);
  if (!r.ok) return Response.json({ error: r.error }, { status: 409 });
  return Response.json(r, { status: 201 });
}
