#!/usr/bin/env tsx
/**
 * End-to-end test for the super-admin agent. Logs in via NextAuth with the
 * seeded super-admin credentials, then asks the agent a real question and
 * prints what comes back (reply + any proposals).
 *
 * Run:  npx tsx scripts/test-agent.ts
 *       npx tsx scripts/test-agent.ts "What needs my attention right now?"
 */
export {}; // mark as ES module so its top-level names don't collide with sibling scripts
const BASE = "http://localhost:3000";
const CREDENTIALS = { email: "superadmin@advancia-training.com", password: "ChangeMe!2026" };
const QUESTION = process.argv[2] ?? "What needs my attention right now? Use your tools to check.";

function parseSetCookie(headers: Headers): string[] {
  // node-fetch / undici exposes getSetCookie() on Headers since Node 19.
  const fn = (headers as any).getSetCookie;
  if (typeof fn === "function") return fn.call(headers);
  const raw = headers.get("set-cookie");
  return raw ? raw.split(/,(?=\s*[\w!#$%&'*+\-.^_`|~]+=)/) : [];
}

function cookieJar() {
  const jar = new Map<string, string>();
  return {
    add(cookies: string[]) {
      for (const c of cookies) {
        const [pair] = c.split(";");
        const eq = pair.indexOf("=");
        if (eq < 0) continue;
        jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
      }
    },
    header(): string {
      return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
  };
}

async function login(): Promise<string> {
  const jar = cookieJar();

  // 1. CSRF token
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  jar.add(parseSetCookie(csrfRes.headers));
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  // 2. Submit credentials to NextAuth callback endpoint
  const form = new URLSearchParams();
  form.set("csrfToken", csrfToken);
  form.set("email", CREDENTIALS.email);
  form.set("password", CREDENTIALS.password);
  form.set("redirect", "false");
  form.set("json", "true");
  const cbRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: jar.header(),
    },
    body: form.toString(),
    redirect: "manual",
  });
  jar.add(parseSetCookie(cbRes.headers));

  // 3. Verify session
  const sessRes = await fetch(`${BASE}/api/auth/session`, { headers: { cookie: jar.header() } });
  const sess = (await sessRes.json()) as { user?: { role?: string; email?: string } };
  if (!sess?.user?.email) {
    console.error("❌ Login failed. Session response:", sess);
    process.exit(1);
  }
  console.log(`✅ Logged in as ${sess.user.email} (role: ${sess.user.role})`);
  return jar.header();
}

async function main() {
  console.log("=== Super-admin agent end-to-end test ===\n");

  const cookie = await login();

  console.log(`\n→ Asking Avi: "${QUESTION}"\n`);
  const t = Date.now();

  const res = await fetch(`${BASE}/api/ai/agent`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ message: QUESTION, history: [] }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`❌ Agent call failed (HTTP ${res.status}): ${text}`);
    process.exit(1);
  }

  const body = (await res.json()) as {
    reply: string;
    proposals: Array<{ id: string; name: string; description: string; input: Record<string, unknown> }>;
    conversationId: string;
  };

  console.log("--- Avi says ---");
  console.log(body.reply || "(no text reply)");
  console.log("");
  if (body.proposals?.length) {
    console.log(`--- Avi proposes ${body.proposals.length} action(s) ---`);
    for (const p of body.proposals) {
      console.log(`  • ${p.name}: ${JSON.stringify(p.input)}`);
    }
  } else {
    console.log("(no mutating actions proposed)");
  }
  console.log(`\n✅ Agent turn completed in ${Date.now() - t}ms`);
  console.log(`   conversationId: ${body.conversationId}`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
