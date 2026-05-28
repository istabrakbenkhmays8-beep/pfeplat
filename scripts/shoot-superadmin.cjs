/* Screenshot the rebuilt super-admin dashboard. */
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3001";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT_DIR = path.resolve("docs/screenshots");

function jar() {
  const m = new Map();
  return {
    add(cs) {
      for (const c of cs || []) {
        const [pair] = c.split(";");
        const eq = pair.indexOf("=");
        if (eq < 0) continue;
        m.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
      }
    },
    header() { return [...m].map(([k, v]) => `${k}=${v}`).join("; "); },
    entries() { return [...m]; },
  };
}
function parseSetCookie(h) {
  if (typeof h.getSetCookie === "function") return h.getSetCookie();
  const a = h.get("set-cookie");
  return a ? a.split(/,(?=\s*[\w!#$%&'*+\-.^_`|~]+=)/) : [];
}

(async () => {
  const j = jar();
  const r1 = await fetch(`${BASE}/api/auth/csrf`);
  j.add(parseSetCookie(r1.headers));
  const { csrfToken } = await r1.json();
  const body = new URLSearchParams({
    csrfToken,
    email: "superadmin@advancia-training.com",
    password: "ChangeMe!2026",
    callbackUrl: BASE,
    json: "true",
  });
  const r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: j.header() },
    body,
  });
  j.add(parseSetCookie(r2.headers));
  const r3 = await fetch(`${BASE}/api/auth/session`, { headers: { cookie: j.header() } });
  j.add(parseSetCookie(r3.headers));
  const session = await r3.json();
  if (!session?.user) throw new Error("not signed in: " + JSON.stringify(session));
  console.log("signed in as", session.user.email);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 1440, height: 2400 },
    args: ["--disable-gpu", "--hide-scrollbars"],
  });
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setCookie(
    ...j.entries().map(([name, value]) => ({
      name, value, domain: "localhost", path: "/", httpOnly: name.includes("session-token"),
    }))
  );
  await page.goto(`${BASE}/super-admin`, { waitUntil: "networkidle2", timeout: 60_000 });
  await new Promise((r) => setTimeout(r, 1500)); // wait for charts to render
  await page.screenshot({ path: path.join(OUT_DIR, "super_dashboard.png") });
  console.log("✓ super_dashboard.png");
  await browser.close();
})();
