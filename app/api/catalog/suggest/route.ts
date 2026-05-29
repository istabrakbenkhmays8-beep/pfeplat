import { NextResponse } from "next/server";
import { searchCatalog } from "@/src/repositories/courseRepo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 1) {
    return NextResponse.json({ items: [] });
  }
  const rows = await searchCatalog({ q });
  const items = rows.slice(0, 8).map((r) => ({
    code: r.code,
    title: r.title,
    vendor: r.category.vendor,
    group: r.category.group,
  }));
  return NextResponse.json({ items });
}
