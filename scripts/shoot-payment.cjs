/* Screenshot just the wallet + a checkout page after the payment-art rewrite. */
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3002";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT_DIR = path.resolve("docs/screenshots");

function cookieJar() {
  const jar = new Map();
  return {
    update(cookies) {
      for (const c of cookies || []) {
        const [pair] = c.split(";");
        const eq = pair.indexOf("=");
        if (eq < 0) continue;
        jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
      }
    },
    header() { return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; "); },
    entries() { return [...jar.entries()]; },
  };
}
function parseSetCookie(h) {
  if (typeof h.getSetCookie === "function") return h.getSetCookie();
  const all = h.get("set-cookie");
  return all ? all.split(/,(?=\s*[\w!#$%&'*+\-.^_`|~]+=)/) : [];
}
async function login(email, password) {
  const jar = cookieJar();
  const r1 = await fetch(`${BASE}/api/auth/csrf`);
  jar.update(parseSetCookie(r1.headers));
  const { csrfToken } = await r1.json();
  const body = new URLSearchParams({ csrfToken, email, password, callbackUrl: BASE, json: "true" });
  const r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST", redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: jar.header() }, body,
  });
  jar.update(parseSetCookie(r2.headers));
  await fetch(`${BASE}/api/auth/session`, { headers: { cookie: jar.header() } });
  return jar;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: "new",
    defaultViewport: { width: 1440, height: 1600 },
    args: ["--disable-gpu", "--hide-scrollbars"],
  });
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();

  const jar = await login("learner@advancia-training.com", "ChangeMe!2026");
  const cookies = jar.entries().map(([name, value]) => ({
    name, value, domain: "localhost", path: "/", httpOnly: name.includes("session-token"),
  }));
  await page.setCookie(...cookies);

  // Wallet
  await page.setViewport({ width: 1440, height: 1400 });
  await page.goto(`${BASE}/wallet`, { waitUntil: "networkidle2", timeout: 30_000 });
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: path.join(OUT_DIR, "user_wallet.png") });
  console.log("✓ user_wallet.png");

  // Checkout for a course
  await page.setViewport({ width: 1440, height: 1400 });
  await page.goto(`${BASE}/checkout?course=PMP`, { waitUntil: "networkidle2", timeout: 30_000 });
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: path.join(OUT_DIR, "user_checkout.png") });
  console.log("✓ user_checkout.png");

  await ctx.close();
  await browser.close();
})();
