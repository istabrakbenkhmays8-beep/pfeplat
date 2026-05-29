import { requireRole } from "@/lib/session";
import {
  isRole,
  isStatus,
  listCountries,
  listUsersForAdmin,
} from "@/src/repositories/userRepo";
import { LEARNER_LEVELS } from "@/src/models";
import { PrintButton } from "./PrintButton";

export const metadata = { title: "Users — print view" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  role?: string;
  status?: string;
  country?: string;
  level?: string;
}>;

export default async function UsersPrintPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole("admin");
  const sp = await searchParams;
  const countries = await listCountries();
  const filters = {
    q: sp.q?.trim() ?? "",
    role: isRole(sp.role) ? sp.role : ("all" as const),
    status: isStatus(sp.status) ? sp.status : ("all" as const),
    country: sp.country && countries.includes(sp.country) ? sp.country : ("all" as const),
    level: sp.level && (LEARNER_LEVELS as readonly string[]).includes(sp.level) ? sp.level : ("all" as const),
  };
  const users = await listUsersForAdmin(filters);
  const now = new Date();

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 14mm; }
          .no-print { display: none !important; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; }
        }
        body { background: white; color: #111; }
      `}</style>

      <div className="bg-white text-black">
        <div className="mx-auto max-w-7xl p-8">
          <header className="mb-6 flex items-end justify-between border-b-2 border-[#E30613] pb-4">
            <div>
              <h1 className="text-2xl font-bold">Advancia Training — User report</h1>
              <p className="mt-1 text-sm text-neutral-600">
                {users.length} {users.length === 1 ? "user" : "users"} ·{" "}
                Generated {now.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}
              </p>
              {(filters.q ||
                filters.role !== "all" ||
                filters.status !== "all" ||
                filters.country !== "all" ||
                filters.level !== "all") && (
                <p className="mt-1 text-xs text-neutral-500">
                  Filters:{" "}
                  {[
                    filters.q && `search="${filters.q}"`,
                    filters.role !== "all" && `role=${filters.role}`,
                    filters.status !== "all" && `status=${filters.status}`,
                    filters.country !== "all" && `country=${filters.country}`,
                    filters.level !== "all" && `level=${filters.level}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
            <div className="text-end">
              <p className="text-xl font-bold text-[#E30613]">ADVANCIA</p>
              <p className="text-xs uppercase tracking-wider text-neutral-500">Training</p>
            </div>
          </header>

          <div className="no-print mb-6 rounded-md border border-neutral-300 bg-neutral-50 p-4 text-sm">
            <p className="font-semibold">Save as PDF</p>
            <p className="mt-1 text-neutral-600">
              Use your browser&apos;s print dialog (Ctrl/⌘ + P) and choose <strong>&quot;Save as PDF&quot;</strong> as the destination.
              Page size is preset to A4 landscape.
            </p>
            <PrintButton />
          </div>

          <table className="w-full text-[10pt]">
            <thead>
              <tr className="border-b-2 border-neutral-300 text-start text-[9pt] uppercase tracking-wider text-neutral-600">
                <th className="px-2 py-2 text-start">First name</th>
                <th className="px-2 py-2 text-start">Surname</th>
                <th className="px-2 py-2 text-start">Email</th>
                <th className="px-2 py-2 text-start">Gender</th>
                <th className="px-2 py-2 text-end">Age</th>
                <th className="px-2 py-2 text-start">Country</th>
                <th className="px-2 py-2 text-start">Level</th>
                <th className="px-2 py-2 text-end">Courses</th>
                <th className="px-2 py-2 text-end">Coins</th>
                <th className="px-2 py-2 text-start">Status</th>
                <th className="px-2 py-2 text-start">Registered</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-200">
                  <td className="px-2 py-1.5">{u.firstName}</td>
                  <td className="px-2 py-1.5">{u.surname}</td>
                  <td className="px-2 py-1.5">{u.email}</td>
                  <td className="px-2 py-1.5">{u.gender}</td>
                  <td className="px-2 py-1.5 text-end">{u.age ?? "—"}</td>
                  <td className="px-2 py-1.5">{u.country || "—"}</td>
                  <td className="px-2 py-1.5">{u.level}</td>
                  <td className="px-2 py-1.5 text-end">{u.coursesJoined}</td>
                  <td className="px-2 py-1.5 text-end font-semibold">{u.walletCoins}</td>
                  <td className="px-2 py-1.5">{u.status}</td>
                  <td className="px-2 py-1.5">
                    {new Date(u.registeredOn).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-neutral-500">
                    No users match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <footer className="mt-8 border-t border-neutral-300 pt-4 text-xs text-neutral-500">
            © {now.getFullYear()} Advancia Training — Confidential
          </footer>
        </div>
      </div>
    </>
  );
}

