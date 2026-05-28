export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    name: "advancia-platform",
    phase: 1,
    time: new Date().toISOString(),
  });
}
