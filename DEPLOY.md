# Deploying Advancia Training to the internet

Two pieces:
1. **MongoDB Atlas** — free hosted MongoDB (the database)
2. **Vercel** — free Next.js hosting (the app)

You'll end up with a shareable `https://advancia-platform.vercel.app` (or your custom domain). One-time setup takes ~20 minutes.

---

## 1) MongoDB Atlas (free tier)

1. Go to **https://cloud.mongodb.com/** and sign up (free, no credit card).
2. Create a new project, e.g. **Advancia**.
3. Click **Build a Database** → choose the **M0 (Free)** shared cluster → pick a region close to Tunis (Frankfurt or Paris work well). Give the cluster a name like `advancia-prod`. Create.
4. While it provisions (~3 min), click **Database Access** in the left nav:
   - **Add New Database User**
   - Username: `advancia`
   - Authentication: **Password** → click **Autogenerate Secure Password** → **copy and save it** (you won't see it again).
   - Built-in role: **Atlas admin** (we'll narrow it later).
   - Save.
5. **Network Access** in the left nav:
   - **Add IP Address** → **Allow Access From Anywhere** (`0.0.0.0/0`). This is fine for Vercel; you can lock down later with Vercel's outbound IPs.
6. Back on **Database** → **Connect** on your cluster:
   - **Drivers** → Node.js → copy the connection string. It looks like:
     ```
     mongodb+srv://advancia:<password>@advancia-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the password from step 4.
   - Append a database name path before the `?`: change `.mongodb.net/?` → `.mongodb.net/advancia?`
   - Final string:
     ```
     mongodb+srv://advancia:YOUR_PASSWORD@advancia-prod.xxxxx.mongodb.net/advancia?retryWrites=true&w=majority
     ```

You'll paste this into Vercel as `MONGODB_URI` below.

---

## 2) Vercel

1. Go to **https://vercel.com/** → **Sign Up with GitHub** → authorize.
2. Click **Add New… → Project** → import `istabrakbenkhmays8-beep/pfeplat`.
3. Vercel auto-detects Next.js. **Framework Preset: Next.js** is correct.
4. **Root Directory**: leave as `/`.
5. Expand **Environment Variables** and add the following (one per row):

   | Name | Value | Notes |
   |---|---|---|
   | `MONGODB_URI` | (the Atlas connection string from above) | required |
   | `NEXTAUTH_URL` | `https://YOUR-PROJECT.vercel.app` | the URL Vercel assigns; update later if you add a custom domain |
   | `NEXTAUTH_SECRET` | (run command below to generate) | required, must be a strong random string |
   | `ANTHROPIC_API_KEY` | (your key from https://console.anthropic.com/) | optional — chatbot stays disabled without it |
   | `ANTHROPIC_MODEL` | `claude-3-5-haiku-20241022` | optional override |

   Generate `NEXTAUTH_SECRET` on your machine:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Copy the output. It looks like `KAr2/jQz...=`.

6. Click **Deploy**. First build takes ~2 minutes. You'll get a URL like `https://pfeplat-xxxxx.vercel.app`.

7. **Update `NEXTAUTH_URL`** if Vercel gave you a different URL than you typed. Go to **Settings → Environment Variables**, edit `NEXTAUTH_URL` to match exactly, then **Settings → Deployments** → trigger a redeploy (or push any commit).

---

## 3) Seed the production database

The fixture users (`superadmin@…`, `admin@…`, `learner@…`) won't exist on Atlas until you seed it.

From your local machine:

```powershell
# Temporarily point local .env at Atlas
# (DO NOT commit this change — .env is gitignored)
Set-Location C:\Users\user\OneDrive\Bureau\pfeplat
# Edit .env and replace MONGODB_URI with your Atlas connection string
npm run db:seed
# After seeding, restore .env to the local docker URI:
#   MONGODB_URI="mongodb://advancia:advancia_dev_pw@localhost:27017/advancia?authSource=admin"
```

You'll see the same `categories=20, courses=30, sessions=30, trainers=4, users=3` confirmation, but now in Atlas.

---

## 4) Verify

Visit your `https://...vercel.app` URL and:
- [ ] Home page renders with hero + KPIs
- [ ] `/catalog` lists 30 courses
- [ ] `/auth/login` accepts `superadmin@advancia-training.com` / `ChangeMe!2026`
- [ ] After signing in as super admin, `/super-admin` loads
- [ ] As learner, enroll in a course, click **Mark complete**, download a certificate PDF
- [ ] Admin: `/admin/users` shows the seeded users; **Export Excel** downloads `.xlsx`

---

## Custom domain (optional)

Vercel → Project → **Settings → Domains** → add `advancia-platform.com` or any domain you own. Update DNS as Vercel instructs. Then update `NEXTAUTH_URL` to the new domain and redeploy.

---

## Production hardening checklist (do these before showing to real users)

- [ ] **Rotate `NEXTAUTH_SECRET`** if you've ever shared this repo.
- [ ] **Narrow Atlas Network Access** to Vercel's outbound IPs (https://vercel.com/docs/edge-network/regions#ip-addresses).
- [ ] **Lock down the Atlas user role** from "Atlas admin" to "readWrite" on the `advancia` database only.
- [ ] **Change the demo passwords** (`ChangeMe!2026`) or delete the fixture users in Atlas after demo.
- [ ] **Set up an email provider** (Brevo, Resend, or SMTP) and wire it into `nodemailer` for the email-verification flow (deferred from Phase 3 — `src/services/aiService.ts` shows the pattern for swappable services).
- [ ] **Add rate limiting** on `/api/auth/*` and `/api/ai/chat` (Upstash Redis or Vercel's Edge Config).
- [ ] **Audit log review** — turn on alerts via Atlas Charts on `auditlogs` collection.

---

## VPS path (alternative to Vercel)

If you prefer a VPS (Railway / Render / Contabo / Hostinger), use the `pm2` ecosystem file:

```bash
# on the VPS, after cloning the repo
npm ci
npm run build
pm2 start npm --name advancia -- start
pm2 save
pm2 startup  # follow the printed command
```

Front it with **Nginx** + **Let's Encrypt** (`certbot --nginx`) for HTTPS. Same env vars as Vercel.
