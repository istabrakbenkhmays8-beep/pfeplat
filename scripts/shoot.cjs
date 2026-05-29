/* Authenticated screenshot helper. Hits NextAuth's credentials endpoint
 * directly to obtain a session cookie, injects it into Puppeteer, then
 * shoots each role's dashboard pages.
 *
 * Usage:  node scripts/shoot.cjs
 */
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3001";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT_DIR = path.resolve("docs/screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

const USERS = {
  learner: { email: "learner@advancia-training.com", password: "ChangeMe!2026" },
  admin: { email: "admin@advancia-training.com", password: "ChangeMe!2026" },
  super: { email: "superadmin@advancia-training.com", password: "ChangeMe!2026" },
};

const PAGES = {
  learner: [
    { name: "user_dashboard", url: "/me", h: 1800 },
    { name: "user_wallet", url: "/wallet", h: 1600 },
    { name: "user_leaderboard", url: "/leaderboard", h: 1600 },
    { name: "user_certificates", url: "/certificates", h: 1600 },
  ],
  admin: [
    { name: "admin_dashboard", url: "/admin", h: 2000 },
    { name: "admin_courses", url: "/admin/courses", h: 1800 },
    { name: "admin_users", url: "/admin/users", h: 1800 },
    { name: "admin_sessions", url: "/admin/sessions", h: 1800 },
  ],
  super: [
    { name: "super_dashboard", url: "/super-admin", h: 2000 },
    { name: "super_admins", url: "/super-admin/admins", h: 1600 },
    { name: "super_reservations", url: "/super-admin/reservations", h: 1600 },
    { name: "super_trainers", url: "/super-admin/trainers", h: 1600 },
    { name: "super_audit", url: "/super-admin/audit", h: 1800 },
  ],
};

function parseSetCookie(headers) {
  // Node 18+ fetch headers have getSetCookie()
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const raw = headers.raw?.()["set-cookie"];
  if (raw) return raw;
  const all = headers.get("set-cookie");
  return all ? all.split(/,(?=\s*[\w!#$%&'*+\-.^_`|~]+=)/) : [];
}

function cookieJar() {
  const jar = new Map();
  return {
    update(setCookies) {
      for (const c of setCookies || []) {
        const [pair] = c.split(";");
        const eq = pair.indexOf("=");
        if (eq < 0) continue;
        const name = pair.slice(0, eq).trim();
        const value = pair.slice(eq + 1).trim();
        jar.set(name, value);
      }
    },
    header() {
      return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    entries() {
      return [...jar.entries()];
    },
  };
}

async function loginViaApi({ email, password }) {
  const jar = cookieJar();
  // 1. CSRF token
  const r1 = await fetch(`${BASE}/api/auth/csrf`);
  jar.update(parseSetCookie(r1.headers));
  const { csrfToken } = await r1.json();
  // 2. Credentials callback
  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: BASE,
    json: "true",
  });
  const r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      cookie: jar.header(),
    },
    body,
  });
  jar.update(parseSetCookie(r2.headers));
  // 3. Hit /api/auth/session to confirm and refresh cookies
  const r3 = await fetch(`${BASE}/api/auth/session`, { headers: { cookie: jar.header() } });
  jar.update(parseSetCookie(r3.headers));
  const session = await r3.json();
  return { jar, session };
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 1440, height: 1800 },
    args: ["--disable-gpu", "--hide-scrollbars"],
  });

  for (const role of Object.keys(PAGES)) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    console.log(`\n=== ${role} ===`);
    try {
      const { jar, session } = await loginViaApi(USERS[role]);
      if (!session?.user) {
        console.error(`  ! no session for ${role}: ${JSON.stringify(session)}`);
        await ctx.close();
        continue;
      }
      console.log(`  signed in as ${session.user.email} (${session.user.role})`);
      const url = new URL(BASE);
      const cookies = jar.entries().map(([name, value]) => ({
        name,
        value,
        domain: url.hostname,
        path: "/",
        httpOnly: name.includes("session-token"),
      }));
      await page.setCookie(...cookies);

      for (const p of PAGES[role]) {
        await page.setViewport({ width: 1440, height: p.h });
        try {
          await page.goto(`${BASE}${p.url}`, { waitUntil: "networkidle2", timeout: 30_000 });
        } catch (e) {
          console.log(`  ! nav ${p.url}: ${e.message.split("\n")[0]}`);
        }
        await new Promise((r) => setTimeout(r, 800));
        const out = path.join(OUT_DIR, `${p.name}.png`);
        await page.screenshot({ path: out, fullPage: false });
        const size = fs.statSync(out).size;
        console.log(`  ✓ ${p.name}  (${(size / 1024).toFixed(0)} KB)`);
      }
    } catch (e) {
      console.error(`  ! ${role} failed: ${e.message}`);
    }
    await ctx.close();
  }

  await browser.close();
})();
