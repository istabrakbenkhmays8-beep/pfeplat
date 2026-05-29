import { z } from "zod";
import { requireRole } from "@/lib/session";
import { executeProposal } from "@/src/services/agentService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  proposal: z.object({
    id: z.string(),
    toolUseId: z.string(),
    name: z.string(),
    description: z.string(),
    input: z.record(z.unknown()),
    resumeContext: z.array(z.unknown()),
    // `provider` was added when the agent gained Groq support. Older proposals
    // (created before this field existed) default to the current AI_PROVIDER at
    // execution time inside agentService, so the field stays optional here.
    provider: z.enum(["groq", "anthropic"]).optional(),
  }),
});

export async function POST(req: Request) {
  const session = await requireRole("super_admin");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "InvalidJson" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "ValidationError" }, { status: 400 });

  // We cast resumeContext through unknown — it's opaque Anthropic shape; we hand it back to the SDK as-is.
  const r = await executeProposal({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proposal: parsed.data.proposal as any,
    actorId: session.user.id,
  });
  if (!r.ok) return Response.json({ error: r.error }, { status: 400 });
  return Response.json(r);
}
