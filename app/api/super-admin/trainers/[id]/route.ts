import { Types } from "mongoose";
import { requireRole } from "@/lib/session";
import { trainerInputSchema } from "@/lib/validators/trainerSchema";
import { updateTrainer } from "@/src/services/trainerService";

export const runtime = "nodejs";

type RouteParams = Promise<{ id: string }>;

export async function PATCH(req: Request, { params }: { params: RouteParams }) {
  await requireRole("super_admin");
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return Response.json({ error: "InvalidId" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = trainerInputSchema.partial().safeParse(body);
  if (!parsed.success) return Response.json({ error: "ValidationError" }, { status: 400 });

  const r = await updateTrainer(id, parsed.data);
  if (!r.ok) return Response.json({ error: r.error }, { status: 404 });
  return Response.json(r);
}
