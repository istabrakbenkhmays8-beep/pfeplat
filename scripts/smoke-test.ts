#!/usr/bin/env tsx
/**
 * Comprehensive smoke test. Hits every public endpoint + a few auth-protected
 * ones to confirm the app is healthy. Prints a punch list of any failures.
 *
 * Usage:  npx tsx scripts/smoke-test.ts [base-url]
 *         (defaults to http://localhost:3005)
 */
const BASE = process.argv[2] ?? "http://localhost:3005";

type Probe = {
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  expect?: number | number[];
  skipIfNoUser?: boolean;
  description: string;
};

const PROBES: Probe[] = [
  // === Public pages ===
  { path: "/", description: "Home page" },
  { path: "/about", description: "About page" },
  { path: "/contact", description: "Contact page" },
  { path: "/catalog", description: "Course catalog" },
  { path: "/catalog/CCNA", description: "Course detail (CCNA)", expect: [200, 404] },
  { path: "/calendrier", description: "Public training calendar (FR)" },
  { path: "/leaderboard", description: "Public leaderboard" },
  { path: "/games", description: "Games index", expect: [200, 307, 308] },

  // === Public API ===
  { path: "/api/health", description: "Health check API" },
  { path: "/api/catalog/suggest?q=ai", description: "Catalog typeahead API" },
  { path: "/sitemap.xml", description: "Sitemap" },
  { path: "/robots.txt", description: "Robots.txt" },

  // === Auth pages ===
  { path: "/auth/login", description: "Login page" },
  { path: "/auth/register", description: "Register page" },
  { path: "/auth/forgot", description: "Forgot-password page" },
  { path: "/auth/reset-password?token=fake", description: "Reset-password page" },

  // === Auth-protected (should 307 redirect to login if unauthenticated) ===
  { path: "/dashboard", description: "User dashboard (auth gate)", expect: [200, 307, 308] },
  { path: "/my-courses", description: "My courses (auth gate)", expect: [200, 307, 308] },
  { path: "/calendar", description: "User calendar (auth gate)", expect: [200, 307, 308] },
  { path: "/wallet", description: "Wallet (auth gate)", expect: [200, 307, 308] },
  { path: "/certificates", description: "Certificates (auth gate)", expect: [200, 307, 308] },
  { path: "/profile", description: "Profile (auth gate)", expect: [200, 307, 308] },
  { path: "/super-admin", description: "Super-admin (RBAC gate)", expect: [200, 307, 308] },
];

async function probe(p: Probe): Promise<{ p: Probe; status: number; ms: number; err?: string }> {
  const url = `${BASE}${p.path}`;
  const t = Date.now();
  try {
    const res = await fetch(url, {
      method: p.method ?? "GET",
      headers: p.body ? { "content-type": "application/json" } : undefined,
      body: p.body ? JSON.stringify(p.body) : undefined,
      redirect: "manual", // we want to see 307s, not follow them
    });
    return { p, status: res.status, ms: Date.now() - t };
  } catch (err: any) {
    return { p, status: 0, ms: Date.now() - t, err: err?.message ?? String(err) };
  }
}

function ok(actual: number, expected: number | number[] | undefined): boolean {
  if (expected === undefined) return actual === 200;
  if (Array.isArray(expected)) return expected.includes(actual);
  return actual === expected;
}

async function main() {
  console.log(`\nSmoke test → ${BASE}\n`);
  console.log("─".repeat(80));

  const results = await Promise.all(PROBES.map(probe));

  let pass = 0;
  let fail = 0;
  for (const r of results) {
    const passed = !r.err && ok(r.status, r.p.expect);
    const mark = passed ? "✓" : "✗";
    const status = r.err ? `ERR: ${r.err}` : String(r.status);
    const expected = r.p.expect ? `(want ${Array.isArray(r.p.expect) ? r.p.expect.join("|") : r.p.expect})` : "";
    console.log(
      `${mark}  ${status.padEnd(8)} ${String(r.ms + "ms").padEnd(8)} ${r.p.path.padEnd(36)} ${r.p.description} ${expected}`,
    );
    if (passed) pass++;
    else fail++;
  }

  console.log("─".repeat(80));
  console.log(`Total: ${results.length} · ✓ ${pass} pass · ✗ ${fail} fail\n`);

  if (fail > 0) {
    console.log("Failures:");
    for (const r of results) {
      const passed = !r.err && ok(r.status, r.p.expect);
      if (!passed) {
        console.log(`  - ${r.p.path}: ${r.err ?? `got ${r.status}`}`);
      }
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
