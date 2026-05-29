ADVANCIA Trainings Platform — Codex Build Prompt
Paste this into Codex as your initial brief, or save it at the repo root as AGENTS.md.
Build incrementally in the Build Order at the bottom. Confirm each phase compiles before moving on.

1. Goal
Build a multi-role online + on-site training platform for Advancia Training (Tunisia), plus a
companion mobile app that uses the same backend. Visitors browse a course catalog and register; users
learn, get assessed, earn/spend coins, and pay for courses; admins manage the platform; a super admin
manages everything including admins, reservations, and trainer assignments. The platform includes an
AI layer: an agent for the super admin and advisory chatbots for admins and users.

The UI is inspired by Udemy (content-dense course cards, category browsing, course-detail with a
sticky purchase panel, clean learning view), rebranded to Advancia's red / white / black identity,
with smooth motion, real imagery, dark + light mode, and a fully responsive layout (mobile,
tablet, desktop).

IMPORTANT — audience: end users are NOT IT experts. Keep all on-screen wording simple, plain, and
non-technical. Clear labels, short sentences, obvious buttons, helpful empty states. No jargon in the UI.

2. Tech Stack (use exactly this)
Language: TypeScript (primary), JS ES6+ only for build scripts.
Web framework: Next.js (App Router) — SSR, React Server Components, route groups per actor space.
UI: React, Tailwind CSS v4 (utility-first), dark/light theme via CSS variables + class strategy.
Motion: Motion (Framer Motion) for animations.
Mobile app: React Native + Expo (TypeScript), sharing the same REST API. (See §11.)
Backend: Node.js + Next.js API Routes (single API serving both web and mobile).
DB: MongoDB with Mongoose (typed schemas, validation, indexes).
Auth: bcryptjs (password hashing) + jose (JWT access + refresh, stateless).
Files / exports: xlsx (Excel import/export), a PDF generator (e.g. pdfkit/@react-pdf/renderer)
for PDF exports and certificates, multer (avatars + bulk imports).
Calendar: a calendar UI lib (e.g. FullCalendar or react-big-calendar on web; an Expo-compatible
calendar on mobile).
Process / deploy: PM2 (VPS) or Vercel (serverless) — see Hosting §12.
Validation: Zod on all API inputs (on top of Mongoose validation).
AI: provider-agnostic AIService adapter. Default to Groq (Llama 3.3 70B) or Anthropic Codex;
must support function/tool calling and streaming. API keys server-side only.

3. Architecture — Custom MVC + Service + Repository
Strict layering. Controllers stay thin; business rules live in services. The mobile app and web share this API.

app/                         # Next.js App Router (route groups per actor)
  (public)/                  # visitor: home, catalog, course detail, contact, auth pages
  (user)/                    # learner space
  (admin)/                   # admin space
  (super-admin)/             # super admin space
  api/                       # API Routes -> controllers (consumed by web + mobile)
src/
  controllers/               # parse request, call service, format response (thin)
  services/                  # business logic: coins, payments, certificates, exports, AI, email
  repositories/              # persistence; the ONLY layer that talks to Mongoose models
  models/                    # Mongoose schemas (validation + indexes)
  lib/                       # auth, rbac middleware, zod validators, mailer, ai, pdf, xlsx, theme
  i18n/                      # en / fr / ar dictionaries + RTL handling
components/                  # React UI (server + client), shared design system
public/                      # images, icons
mobile/                      # Expo React Native app (consumes the same API)

Rule: Controllers never touch Mongoose. Services orchestrate; repositories persist. The AI agent calls
the same guarded services — it never bypasses business logic or RBAC.

4. Actors & RBAC
Capability                                              Visitor  User  Admin  Super Admin
Browse catalog / home / contact                            ✓      ✓     ✓        ✓
Register / login                                           ✓      ✓     ✓        ✓
Enroll, learn, assessments, coins, games, certificates            ✓
Export a course as PDF                                            ✓     ✓        ✓
Pay (card / wallet)                                               ✓
Manage courses, categories, sessions, users                              ✓        ✓
Export data as Excel or PDF (user table)                                 ✓        ✓
Import data (XLSX)                                                       ✓        ✓
Admin dashboard + calendar                                               ✓        ✓
Manage admins                                                                     ✓
Manage reservations (approve/confirm)                                             ✓
Assign trainers + send trainer email                                              ✓
Audit log + global settings                                                       ✓

Trainer is NOT a login role — managed data (name, email, specialty). Super admin assigns a trainer to a
session and the system emails them date/time, location/link, course, and enrolled count.

Enforce RBAC in middleware on every API route from the JWT. Never trust the client.

5. Data Models (Mongoose)
Schemas with validation + indexes: User (role enum, status, firstName, surname, email, gender, age,
country, level, walletCoins, avatar), Course (category, modes[], price, coinReward, isGame, media),
Category, Session (course ref, mode online/onsite, datetime, capacity, location/meetingLink, trainer
ref, status), Trainer (data only, no auth), Reservation (user, session, status), Enrollment (user,
course, progress, completedAt, coinsAwarded bool), Assessment + AssessmentResult, Certificate (user,
course, issuedAt, pdfUrl), Payment (method, amount, coinsUsed, gateway ref, status), CoinTransaction
(earn/spend, reason, balance after), EmailToken (hashed token, type, expiresAt, usedAt), AuditLog
(actor, action, target, before/after, timestamp), AIConversation (role scope, messages, tool calls).

The User model must carry the fields used in the export table (§7): firstName, surname, email, gender,
age, country, level, plus their enrollments (courses/trainings joined).

6. Feature Modules
Catalog — categories, filters (category, mode, level, price, rating, language), search, course
detail (Udemy-style: "what you'll learn", modes, rating/reviews, sticky enroll panel), featured section.
Course delivery — 3 modes: live online sessions (meeting link), on-site sessions (reservation
capacity), self-paced (PDF/video). A course can combine modes.
Game-courses — interactive scored lessons feeding coins + leaderboard.
Assessment & certification — quiz/exam per course, pass threshold, auto PDF certificate on pass.
Wallet & coins economy (anti-abuse, server-side):
Coins awarded only on first completion + passing, then locked (no re-farming).
Fixed configurable rate (e.g. 100 coins = 1 free course, or coins = % discount). Partial payment
(coins + card). Every change writes a CoinTransaction. Add streaks, badges, levels, leaderboard.
Payments — swappable gateway adapter. No Stripe in Tunisia → target Paymee / Konnect / Flouci,
with a mock gateway for dev/demo. Card + wallet via one PaymentService.
Reservations — book sessions, capacity limits, super admin approval → on confirm, lock schedule +
email assigned trainer.
Trainings Calendar — calendar view (month / week / day) of all sessions/trainings; click a session for
details; filters by category, mode, trainer, status. Users see sessions they can join / are enrolled
in; admins/super admin see and manage all.
Exports (see §7) — user exports a course as PDF; admin/super admin export the user table as
Excel or PDF.
Import — XLSX import (users/courses/enrollments) with validation.
Dashboards — clear, simple layout (§9). Admin: enrollments, revenue, completion, popular courses,
calendar. Super Admin: + admin activity, audit log, global KPIs.
Filters everywhere — catalog, all data tables, dashboards, calendar, user lists, reservations. A
consistent reusable filter component (search + dropdowns + date range + clear-all).
Notifications — email + in-app (enrollment, session reminder, coins earned, certificate ready).
i18n — EN / FR / AR with full RTL for Arabic.
Contact page — public page with company info, map/address, and a contact form (name, email, subject,
message) that emails Advancia + stores the message; simple validation, plain wording.

7. Exports (explicit)
User — export a course as PDF: generate a clean, branded PDF of the course content/lessons (and their
certificate as a separate PDF on completion).

Admin & Super Admin — export the users table as Excel OR PDF. One large table with columns:
First name | Surname | Email | Gender | Age | Country | Level | Courses/Trainings joined | Coins | Status | Registered on

The export respects whatever filters are active (so they can export a filtered subset).
Excel via xlsx (styled header, auto column widths); PDF via the PDF generator (landscape, repeating
header row, page numbers, Advancia branding). Same data source for both formats.

8. Email Flows (one EmailService adapter; Nodemailer + SMTP; Mailtrap/Brevo/Resend for dev)
Register → welcome + verify: account starts unverified; tokenized link /verify?token=...; activate on click.
Forgot password → reset: always reply "if this email exists, a link was sent" (no enumeration); store a
hashed one-time token (15–30 min expiry), email /reset-password?token=..., hash new password, invalidate token.
Trainer assignment: on session confirm, email the trainer date/time, location/link, course, enrolled count.
Contact form: email Advancia the submitted message.

9. Dashboards — clear, beginner-friendly layout
Layout: top bar (search + theme toggle + language + profile) → left sidebar nav → main area with a row of
KPI cards (big number + label + small trend), then charts, then a filterable data table.
Plain labels ("Active learners", "Courses this month") — no technical terms. Tooltips for anything unclear.
Consistent spacing, generous whitespace, clear hierarchy. Loading skeletons, empty states ("No data yet"),
and error states everywhere. Mobile: sidebar collapses to a drawer; cards stack; tables scroll horizontally.

10. Themes & Responsive
Dark + Light mode: theme toggle in the header. Respect the OS preference on first visit, then remember
the user's choice (cookie for SSR-safe theming). All colors from CSS variables so both themes stay consistent.
Responsive (mobile / tablet / desktop): mobile-first. Breakpoints for phone, tablet, desktop. Nav becomes
a hamburger/drawer on small screens; grids reflow (1 → 2 → 3/4 columns); tables scroll or switch to card
layout on mobile; tap targets sized for touch.

11. Companion Mobile App (Expo / React Native)
Separate Expo (React Native + TypeScript) app in /mobile, consuming the same REST API and JWT auth.
Scope: visitor browse + register/login, user learning experience (catalog, enroll, lessons, assessments,
coins/wallet, certificates, leaderboard, calendar of trainings, the user chatbot). Admin/super-admin
management stays primarily on web (optionally a read-only dashboard on mobile).
Reuse the design language (red/white/black, dark/light), native navigation, and the same plain wording.
Demo/share: run via Expo Go (QR code) for the jury, or build with EAS Build for an installable APK.

12. Hosting / Sharing a Link
Make it openable by anyone via a URL. Two paths — pick one:
Easiest (recommended for the demo): deploy the Next.js app to Vercel (free), with MongoDB Atlas
(free tier) as the database and a transactional email provider (Brevo/Resend). API routes run serverless.
You get a shareable https://...vercel.app link.
VPS path (matches PM2): deploy on a VPS (Railway/Render/Contabo/Hostinger) running Node + PM2 behind
Nginx, with MongoDB Atlas. Add a domain + HTTPS (Let's Encrypt).
Put secrets in env vars on the host; never commit .env. Mobile app points to the deployed API URL.

13. AI Layer (the differentiator)
All AI goes through one server-side AIService adapter (swappable provider, tool calling, streaming,
rate-limited, keys never exposed to client). Each assistant is scoped to the caller's role.

13a. Super Admin → Agent (acts + advises)
Tools map 1:1 to existing guarded services (RBAC super_admin enforced server-side): createCourse,
updateCourse, assignTrainer (fires email), createSession, approveReservation, createAdmin,
exportData(type, format), importData, getAnalytics(metric).
Human-in-the-loop: mutating actions go propose → super admin confirms → execute. Read-only runs directly.
Proactive mode: reads KPIs and suggests next steps ("3 sessions next week have no trainer — assign now?",
"Course X completion is 12% — review?", "5 users awaiting verification").
Every agent action writes to the AuditLog.

13b. Admin → Chatbot (advisory: "what's next on the platform")
Read-scoped to admin data; answers how-to in plain language; surfaces pending items (courses missing a
category, users awaiting verification, imports to review) with deep links. No destructive actions.

13c. User → Chatbot (advisory: "what's next for your profile")
Personalized from the user's own progress (RAG over their enrollments): recommends next course/learning path,
shows coins balance + how to earn more, nudges incomplete courses, explains certificates, suggests games.

Name the assistants in the UI (friendly, distinct). Stream responses; typing indicator; persist threads.

14. Security (non-negotiable)
RBAC middleware on every API route, role from verified JWT. JWT access + refresh (short access, rotating refresh).
Rate-limit auth + AI endpoints; lockout after N failed logins.
multer: whitelist mime types + size caps. Zod validation on all inputs; sanitize before persist.
Password reset: hashed one-time tokens, expiry, no enumeration.
Audit log for all admin/super-admin/agent actions. AI keys server-side only.

15. Build Order (phases — verify each compiles)
Scaffold — Next.js App Router + TS + Tailwind v4 + theme system (dark/light) + responsive shell + folder structure + route groups.
Models + DB — Mongoose connection, all schemas (incl. full user profile fields) with indexes/validation.
Auth — register (+ verify), login (JWT access/refresh), forgot/reset, RBAC middleware.
Public site — home, catalog (with filters), course detail, contact page (Udemy-style design, motion, images, responsive).
User space — enroll, 3 learning modes, assessments, certificates, wallet/coins, games, leaderboard, export course PDF.
Payments — PaymentService + mock gateway (+ Paymee/Konnect/Flouci adapter), card + wallet, partial pay.
Admin space — manage courses/categories/sessions/users, filters, import XLSX, export users table (Excel + PDF), dashboard.
Calendar — trainings calendar (month/week/day) with filters, shared by user + admin views.
Super admin space — manage admins, reservations (approval + trainer email), audit log, settings, dashboard.
AI layer — AIService adapter → User chatbot → Admin chatbot → Super Admin agent (tools + HITL + proactive).
i18n — EN/FR/AR + RTL across web (and mobile).
Mobile app — Expo app consuming the API (visitor + user scope).
Polish + Deploy — animations pass, empty/loading/error states, plain-language copy review, then host (Vercel or PM2/VPS) for a shareable link.

16. Conventions
Strict TypeScript, no any without reason. Zod schemas colocated with controllers.
Server Components by default; "use client" only when needed. Reusable filter, table, KPI-card, and theme components.
Secrets in .env; provide .env.example. Explain each phase before generating large diffs.
Keep every user-facing string simple and non-technical (audience is not IT).
