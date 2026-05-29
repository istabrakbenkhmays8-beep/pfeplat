import { z } from "zod";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { User, AuditLog } from "@/src/models";
import { LEARNER_LEVELS, GENDERS } from "@/src/models";

export const runtime = "nodejs";

const rowSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  surname: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  gender: z.enum(GENDERS).optional(),
  age: z.coerce.number().min(10).max(120).optional(),
  country: z.string().trim().max(80).optional(),
  level: z.enum(LEARNER_LEVELS).optional(),
});

type ParsedRow = { ok: true; data: z.infer<typeof rowSchema> } | { ok: false; rowIndex: number; errors: string[]; raw: Record<string, unknown> };

const DEFAULT_PW = "ChangeMe!2026";

export async function POST(req: Request) {
  const session = await requireRole("admin");
  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") !== "0";

  let buf: ArrayBuffer;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "FileMissing" }, { status: 400 });
    }
    if (file.size > 2_000_000) {
      return Response.json({ error: "FileTooLarge", maxBytes: 2_000_000 }, { status: 413 });
    }
    buf = await file.arrayBuffer();
  } catch {
    return Response.json({ error: "BadRequest" }, { status: 400 });
  }

  let json: Record<string, unknown>[];
  try {
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  } catch {
    return Response.json({ error: "CouldNotParseXlsx" }, { status: 400 });
  }

  const parsed: ParsedRow[] = json.map((row, i) => {
    // Allow flexible header casing (First Name, firstname, etc.).
    const norm: Record<string, unknown> = {};
    for (const k of Object.keys(row)) {
      const key = k.toLowerCase().replace(/[\s_-]+/g, "");
      norm[key] = row[k];
    }
    const candidate = {
      firstName: norm.firstname,
      surname: norm.surname ?? norm.lastname,
      email: norm.email,
      gender: norm.gender,
      age: norm.age,
      country: norm.country,
      level: norm.level,
    };
    const r = rowSchema.safeParse(candidate);
    if (r.success) return { ok: true, data: r.data };
    return {
      ok: false,
      rowIndex: i + 2, // +2: skip header + 0-indexing
      errors: r.error.issues.map((iss) => `${iss.path.join(".") || "row"}: ${iss.message}`),
      raw: row,
    };
  });

  const valid = parsed.filter((p): p is Extract<ParsedRow, { ok: true }> => p.ok);
  const invalid = parsed.filter((p): p is Extract<ParsedRow, { ok: false }> => !p.ok);

  if (dryRun) {
    return Response.json({
      ok: true,
      dryRun: true,
      total: parsed.length,
      validCount: valid.length,
      invalidCount: invalid.length,
      sample: valid.slice(0, 5).map((v) => v.data),
      errors: invalid.slice(0, 50),
    });
  }

  // Commit: upsert each valid row.
  await connectDb();
  const passwordHash = await bcrypt.hash(DEFAULT_PW, 10);
  let inserted = 0;
  let updated = 0;
  for (const v of valid) {
    const existing = await User.findOne({ email: v.data.email }).select("_id");
    if (existing) {
      await User.updateOne(
        { _id: existing._id },
        { $set: { ...v.data } },
      );
      updated += 1;
    } else {
      await User.create({
        ...v.data,
        passwordHash,
        role: "user",
        status: "active",
      });
      inserted += 1;
    }
  }

  await AuditLog.create({
    actor: session.user.id,
    actorRole: session.user.role,
    action: "user.created",
    targetType: "User",
    metadata: { source: "xlsx_import", inserted, updated, invalid: invalid.length },
  });

  return Response.json({
    ok: true,
    dryRun: false,
    total: parsed.length,
    inserted,
    updated,
    invalidCount: invalid.length,
    errors: invalid.slice(0, 50),
    defaultPassword: DEFAULT_PW,
  });
}
