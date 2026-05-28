import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireRole } from "@/lib/session";
import { isRole, isStatus, listCountries, listUsersForAdmin } from "@/src/repositories/userRepo";
import { LEARNER_LEVELS } from "@/src/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = [
  "First name",
  "Surname",
  "Email",
  "Gender",
  "Age",
  "Country",
  "Level",
  "Courses joined",
  "Coins",
  "Role",
  "Status",
  "Registered on",
] as const;

export async function GET(req: Request) {
  await requireRole("admin");
  const url = new URL(req.url);
  const format = (url.searchParams.get("format") || "xlsx").toLowerCase();

  const countries = await listCountries();
  const q = url.searchParams.get("q") ?? "";
  const roleRaw = url.searchParams.get("role") ?? "";
  const statusRaw = url.searchParams.get("status") ?? "";
  const countryRaw = url.searchParams.get("country") ?? "";
  const levelRaw = url.searchParams.get("level") ?? "";

  const rows = await listUsersForAdmin({
    q,
    role: isRole(roleRaw) ? roleRaw : "all",
    status: isStatus(statusRaw) ? statusRaw : "all",
    country: countryRaw && countries.includes(countryRaw) ? countryRaw : "all",
    level:
      levelRaw && (LEARNER_LEVELS as readonly string[]).includes(levelRaw)
        ? levelRaw
        : "all",
  });

  const aoa: Array<Array<string | number>> = [Array.from(HEADERS)];
  for (const u of rows) {
    aoa.push([
      u.firstName,
      u.surname,
      u.email,
      u.gender,
      u.age ?? "",
      u.country,
      u.level,
      u.coursesJoined,
      u.walletCoins,
      u.role,
      u.status,
      new Date(u.registeredOn).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    ]);
  }

  if (format === "csv") {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="advancia-users-${stamp()}.csv"`,
      },
    });
  }

  if (format === "pdf") {
    // Redirect to the server-rendered printable page; user prints / saves as PDF.
    const print = new URL("/admin/users/print", url.origin);
    print.search = url.search.replace(/(^|&)format=pdf(&|$)/, "$1").replace(/^&|&$/g, "");
    return NextResponse.redirect(print);
  }

  // Default: xlsx
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  // Auto-size columns roughly based on max content width
  const colWidths = HEADERS.map((h, i) => {
    let max = h.length;
    for (let r = 1; r < aoa.length; r++) {
      const v = aoa[r][i];
      const len = v == null ? 0 : String(v).length;
      if (len > max) max = len;
    }
    return { wch: Math.min(max + 2, 40) };
  });
  ws["!cols"] = colWidths;
  // Style the header row a touch (bold)
  const range = XLSX.utils.decode_range(ws["!ref"]!);
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) ws[addr].s = { font: { bold: true } };
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="advancia-users-${stamp()}.xlsx"`,
      "content-length": String(blob.size),
    },
  });
}

function stamp() {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}`;
}
