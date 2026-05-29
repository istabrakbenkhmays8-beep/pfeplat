#!/usr/bin/env tsx
/**
 * Generates `prompt.pdf` at the project root — a text document containing every
 * prompt used to build and run the Advancia Training platform, step by step:
 *
 *   Part 1 — The master build brief (CLAUDE.md), section by section
 *   Part 2 — The 13-phase build order, each phase as its own step
 *   Part 3 — Runtime AI prompts (Ada / Adi / Avi)
 *
 * Run: npm run gen:prompt
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Ellipse,
  Polygon,
  renderToFile,
} from "@react-pdf/renderer";
import path from "node:path";

const BRAND = "#C70019";
const INK = "#111111";
const MUTED = "#5b6470";
const RULE = "#e5e7eb";
const CODE_BG = "#f5f5f5";

const FONT = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";
const FONT_OBL = "Helvetica-Oblique";
const FONT_MONO = "Courier";

const s = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: FONT,
    fontSize: 10.5,
    lineHeight: 1.5,
    color: INK,
  },
  pageNum: {
    position: "absolute",
    bottom: 24,
    right: 56,
    fontSize: 8,
    color: MUTED,
  },
  topRule: {
    position: "absolute",
    top: 24,
    left: 56,
    right: 56,
    fontSize: 8,
    color: MUTED,
    borderBottomWidth: 0.5,
    borderBottomColor: RULE,
    paddingBottom: 6,
  },

  h1: { fontFamily: FONT_BOLD, fontSize: 22, color: INK, marginBottom: 6 },
  h2: {
    fontFamily: FONT_BOLD,
    fontSize: 14,
    color: BRAND,
    marginTop: 18,
    marginBottom: 6,
  },
  h3: {
    fontFamily: FONT_BOLD,
    fontSize: 11,
    color: INK,
    marginTop: 12,
    marginBottom: 4,
  },
  p: { marginBottom: 6, color: INK },
  muted: { color: MUTED, fontSize: 9, marginBottom: 10 },
  bullet: { marginLeft: 14, marginBottom: 3 },
  code: {
    fontFamily: FONT_MONO,
    fontSize: 9,
    backgroundColor: CODE_BG,
    padding: 8,
    borderRadius: 4,
    color: INK,
    marginBottom: 8,
  },
  step: {
    borderLeftWidth: 3,
    borderLeftColor: BRAND,
    paddingLeft: 12,
    paddingRight: 8,
    paddingTop: 6,
    paddingBottom: 8,
    marginBottom: 10,
    backgroundColor: "#fbfbfb",
  },
  stepLabel: {
    fontFamily: FONT_BOLD,
    color: BRAND,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 2,
  },
  stepTitle: { fontFamily: FONT_BOLD, fontSize: 12, marginBottom: 4 },
  promptCard: {
    borderWidth: 0.5,
    borderColor: RULE,
    padding: 12,
    marginTop: 6,
    marginBottom: 14,
    borderRadius: 6,
    backgroundColor: "#fbfbfb",
  },
  promptHead: {
    fontFamily: FONT_BOLD,
    fontSize: 11,
    marginBottom: 2,
  },
  promptSub: { fontSize: 9, color: MUTED, marginBottom: 6 },
  promptBody: {
    fontFamily: FONT_OBL,
    fontSize: 10,
    color: INK,
    lineHeight: 1.55,
  },

  // Cover
  cover: { textAlign: "center", marginTop: 200 },
  coverTitle: { fontFamily: FONT_BOLD, fontSize: 34, color: INK, marginBottom: 4 },
  coverSub: { fontSize: 14, color: MUTED, marginBottom: 4 },
  coverBadge: {
    marginTop: 18,
    alignSelf: "center",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: "#fde7ec",
    borderRadius: 12,
    fontFamily: FONT_BOLD,
    fontSize: 10,
    color: BRAND,
  },
});

// ─────────────────────────── helpers ───────────────────────────

function Header({ label }: { label: string }) {
  return <Text style={s.topRule}>Advancia Training — Prompts · {label}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <Text style={s.bullet}>
      <Text style={{ color: BRAND, fontFamily: FONT_BOLD }}>• </Text>
      {children}
    </Text>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <Text style={s.p}>{children}</Text>;
}

function Step({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <View style={s.step} wrap={false}>
      <Text style={s.stepLabel}>STEP {String(n).padStart(2, "0")}</Text>
      <Text style={s.stepTitle}>{title}</Text>
      <Text style={s.p}>{body}</Text>
    </View>
  );
}

function PromptCard({
  name,
  scope,
  body,
}: {
  name: string;
  scope: string;
  body: string;
}) {
  return (
    <View style={s.promptCard}>
      <Text style={s.promptHead}>{name}</Text>
      <Text style={s.promptSub}>{scope}</Text>
      <Text style={s.promptBody}>{body}</Text>
    </View>
  );
}

// ─────────────────────────── pages ───────────────────────────

function CoverPage() {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.cover}>
        <Svg width={130} height={52} viewBox="0 0 130 52" style={{ alignSelf: "center" }}>
          <Ellipse cx={26} cy={26} rx={22} ry={22} fill={BRAND} />
          <Polygon points="20,14 20,38 38,26" fill="#ffffff" />
          <Text x={56} y={32} style={{ fontFamily: FONT_BOLD, fontSize: 22, fill: INK }}>
            ADVANCIA
          </Text>
        </Svg>
        <Text style={s.coverTitle}>Prompts</Text>
        <Text style={s.coverSub}>The full set of prompts used to build and run</Text>
        <Text style={s.coverSub}>the Advancia Training platform — step by step.</Text>
        <Text style={s.coverBadge}>PFE — Final Project</Text>
      </View>
      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  );
}

// PART 1 — Master brief (extracted from CLAUDE.md) -------------------------
function MasterPromptPage() {
  return (
    <Page size="A4" style={s.page}>
      <Header label="Part 1 — Master build brief" />
      <Text style={s.h1}>Part 1 — Master build brief</Text>
      <Text style={s.muted}>
        Section-by-section restatement of the brief Claude Code was given as its initial prompt
        (CLAUDE.md). Build incrementally; confirm each phase compiles before moving on.
      </Text>

      <Text style={s.h2}>1. Goal</Text>
      <Para>
        Build a multi-role online + on-site training platform for Advancia Training (Tunisia), plus a
        companion mobile app that shares the same backend. Visitors browse a course catalog and
        register; users learn, get assessed, earn / spend coins, and pay for courses; admins manage
        the platform; a super admin manages everything including admins, reservations, and trainer
        assignments. The platform includes an AI layer: an agent for the super admin and advisory
        chatbots for admins and users.
      </Para>
      <Para>
        The UI is Udemy-inspired (content-dense course cards, category browsing, course-detail with a
        sticky purchase panel, clean learning view), rebranded to Advancia&rsquo;s red / white / black
        identity, with smooth motion, real imagery, dark + light mode, and a fully responsive layout.
      </Para>
      <Para>
        IMPORTANT — audience: end users are NOT IT experts. Keep all on-screen wording simple, plain,
        and non-technical. Clear labels, short sentences, obvious buttons, helpful empty states. No
        jargon in the UI.
      </Para>

      <Text style={s.h2}>2. Tech stack</Text>
      <Bullet>TypeScript primary; JS ES6+ only for build scripts.</Bullet>
      <Bullet>Web: Next.js App Router (SSR, RSC, route groups per actor).</Bullet>
      <Bullet>UI: React, Tailwind CSS v4, CSS variables + class strategy for dark/light.</Bullet>
      <Bullet>Motion: Framer Motion.</Bullet>
      <Bullet>Mobile: React Native + Expo (TS), same REST API.</Bullet>
      <Bullet>Backend: Node + Next.js API Routes (single API for web + mobile).</Bullet>
      <Bullet>DB: MongoDB + Mongoose (typed schemas, validation, indexes).</Bullet>
      <Bullet>Auth: bcryptjs + jose (JWT access + refresh, stateless).</Bullet>
      <Bullet>Files: xlsx (Excel), pdfkit / @react-pdf/renderer (PDFs, certificates), multer.</Bullet>
      <Bullet>Calendar: FullCalendar or react-big-calendar on web; Expo-compatible calendar on mobile.</Bullet>
      <Bullet>Deploy: PM2 (VPS) or Vercel (serverless).</Bullet>
      <Bullet>Validation: Zod on every API input.</Bullet>
      <Bullet>AI: provider-agnostic AIService adapter — Groq (Llama 3.3 70B) or Anthropic Claude; tool calling + streaming; keys server-side only.</Bullet>

      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  );
}

function MasterPromptPage2() {
  return (
    <Page size="A4" style={s.page}>
      <Header label="Part 1 — Master build brief (cont.)" />

      <Text style={s.h2}>3. Architecture — custom MVC + service + repository</Text>
      <Para>
        Strict layering: controllers stay thin, business rules live in services, repositories are the
        only layer that talks to Mongoose models. The mobile app and web share this API.
      </Para>
      <Text style={s.code}>
{`app/                          Next.js App Router (route groups per actor)
  (public)/                   visitor: home, catalog, course detail, contact
  (user)/                     learner space
  (admin)/                    admin space
  (super-admin)/              super admin space
  api/                        API Routes → controllers
src/
  controllers/                parse request, call service, format response
  services/                   coins, payments, certificates, exports, AI, email
  repositories/               persistence (only layer talking to Mongoose)
  models/                     Mongoose schemas (validation + indexes)
  lib/                        auth, rbac, zod, mailer, ai, pdf, xlsx, theme
  i18n/                       en / fr / ar + RTL
components/                   shared React UI
public/                       images, icons
mobile/                       Expo React Native app`}
      </Text>
      <Para>
        Rule: controllers never touch Mongoose. Services orchestrate; repositories persist. The AI
        agent calls the same guarded services — never bypasses business logic or RBAC.
      </Para>

      <Text style={s.h2}>4. Actors & RBAC</Text>
      <Bullet>Visitor — browse catalog, register, log in.</Bullet>
      <Bullet>User — enroll, learn, take assessments, earn/spend coins, games, certificates, pay (card/wallet), export a course as PDF.</Bullet>
      <Bullet>Admin — manage courses/categories/sessions/users, import XLSX, export users (Excel + PDF), calendar, admin dashboard.</Bullet>
      <Bullet>Super Admin — everything above plus manage admins, approve reservations, assign trainers (sends email), audit log, settings, AI agent.</Bullet>
      <Bullet>Trainer — data only, not a login role. Super admin assigns a trainer to a session and the system emails them date/time, location/link, course, enrolled count.</Bullet>
      <Para>RBAC enforced in middleware on every API route from a verified JWT — never trust the client.</Para>

      <Text style={s.h2}>5. Data model</Text>
      <Para>
        Mongoose schemas with validation + indexes: User, Course, Category, Session, Trainer,
        Reservation, Enrollment, Assessment + AssessmentResult, Certificate, Payment, CoinTransaction,
        EmailToken, AuditLog, AIConversation. User profile fields drive the exportable users table
        (firstName, surname, email, gender, age, country, level, enrollments, coins, status,
        registered-on).
      </Para>

      <Text style={s.h2}>6. Feature modules</Text>
      <Bullet>Catalog — categories, filters (category, mode, level, price, rating, language), search, course detail (Udemy-style), featured.</Bullet>
      <Bullet>Course delivery — 3 modes: live_online, on_site, self_paced. A course may combine modes.</Bullet>
      <Bullet>Game-courses — interactive scored lessons feeding coins + leaderboard.</Bullet>
      <Bullet>Assessment & certification — quiz per course, pass threshold, auto PDF certificate on pass.</Bullet>
      <Bullet>Wallet & coins — server-side, anti-abuse. Coins awarded only on first completion + passing, then locked. Partial pay (coins + card). CoinTransaction written on every change. Streaks, badges, levels, leaderboard.</Bullet>
      <Bullet>Payments — swappable gateway adapter. Targets Paymee / Konnect / Flouci, with a mock gateway for dev/demo.</Bullet>
      <Bullet>Reservations — book sessions, capacity, super-admin approval → confirm → lock schedule + email trainer.</Bullet>
      <Bullet>Trainings calendar — month/week/day, filters by category, mode, trainer, status.</Bullet>
      <Bullet>Exports — user: course-as-PDF + certificate PDF. Admin/super-admin: users table as XLSX or PDF, honoring active filters.</Bullet>
      <Bullet>Import — XLSX import (users/courses/enrollments) with validation.</Bullet>
      <Bullet>Dashboards — top bar, sidebar, KPI cards, charts, filterable table. Plain labels. Skeletons + empty states everywhere.</Bullet>
      <Bullet>Filters everywhere — one reusable filter component (search + dropdowns + date range + clear-all).</Bullet>
      <Bullet>Notifications — email + in-app (enrollment, session reminder, coins earned, certificate ready).</Bullet>
      <Bullet>i18n — EN / FR / AR with full RTL for Arabic.</Bullet>
      <Bullet>Contact page — public, with company info, map, contact form (validated, emails Advancia, stores the message).</Bullet>

      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  );
}

function MasterPromptPage3() {
  return (
    <Page size="A4" style={s.page}>
      <Header label="Part 1 — Master build brief (cont.)" />

      <Text style={s.h2}>7. Exports (explicit)</Text>
      <Para>
        User — export a course as a clean, branded PDF (and certificate PDF on completion).
      </Para>
      <Para>
        Admin & Super Admin — export the users table as Excel OR PDF, with columns:
      </Para>
      <Text style={s.code}>
{`First name | Surname | Email | Gender | Age | Country | Level
| Courses/Trainings joined | Coins | Status | Registered on`}
      </Text>
      <Para>
        The export respects active filters (filtered subset). Excel via xlsx (styled header,
        auto-widths); PDF landscape with repeating header row, page numbers, Advancia branding.
      </Para>

      <Text style={s.h2}>8. Email flows</Text>
      <Bullet>Register → welcome + verify (token link /verify, hashed one-time token).</Bullet>
      <Bullet>Forgot password → reset; always reply &ldquo;if this email exists, a link was sent&rdquo;.</Bullet>
      <Bullet>Trainer assignment — on session confirm, email trainer date/time, location/link, course, enrolled count.</Bullet>
      <Bullet>Contact form — email Advancia.</Bullet>

      <Text style={s.h2}>9. Dashboards — clear, beginner-friendly</Text>
      <Para>
        Top bar (search + theme + language + profile) → left sidebar → main: KPI row, then charts,
        then filterable table. Plain labels (&ldquo;Active learners&rdquo;, &ldquo;Courses this month&rdquo;). Tooltips for
        anything unclear. Skeletons, empty states (&ldquo;No data yet&rdquo;), error states. Mobile: sidebar
        collapses, cards stack, tables scroll.
      </Para>

      <Text style={s.h2}>10. Themes & responsive</Text>
      <Para>
        Dark + light, toggle in the header. OS preference on first visit, then remember (cookie for
        SSR). All colors from CSS variables. Mobile-first. Breakpoints for phone / tablet / desktop.
        Nav becomes a drawer on small screens; grids reflow 1 → 2 → 3/4 columns; tables scroll or
        switch to card layout on mobile.
      </Para>

      <Text style={s.h2}>11. Companion mobile app (Expo)</Text>
      <Para>
        Separate Expo React Native TS app in /mobile, same REST API and JWT auth. Scope: visitor
        browse + register/login + user learning (catalog, enroll, lessons, assessments,
        coins/wallet, certificates, leaderboard, calendar, user chatbot). Admin management stays
        primarily on web. Demo via Expo Go (QR code) or EAS Build for an installable APK.
      </Para>

      <Text style={s.h2}>12. Hosting</Text>
      <Bullet>Easiest — Vercel + MongoDB Atlas + Brevo/Resend for email. API routes serverless. Shareable https://*.vercel.app URL.</Bullet>
      <Bullet>VPS path — Node + PM2 behind Nginx + MongoDB Atlas + domain + HTTPS (Let&rsquo;s Encrypt).</Bullet>
      <Bullet>Secrets in env vars on the host. Mobile app points at the deployed API URL.</Bullet>

      <Text style={s.h2}>13. AI layer — the differentiator</Text>
      <Para>
        All AI goes through one server-side AIService adapter (swappable provider, tool calling,
        streaming, rate-limited, keys never exposed to client). Each assistant is scoped to the
        caller&rsquo;s role.
      </Para>
      <Bullet>
        Super Admin → Agent (acts + advises). Tools map 1:1 to existing guarded services: createCourse,
        updateCourse, assignTrainer (fires email), createSession, approveReservation, createAdmin,
        exportData, importData, getAnalytics. Mutating actions go propose → super admin confirms →
        execute. Read-only runs directly. Proactive: surfaces &ldquo;3 sessions next week have no trainer
        — assign now?&rdquo; etc. Every agent action writes to the AuditLog.
      </Bullet>
      <Bullet>
        Admin → Chatbot (advisory). Read-scoped to admin data; answers how-to; surfaces pending
        items. No destructive actions.
      </Bullet>
      <Bullet>
        User → Chatbot (advisory). Personalized from the user&rsquo;s own progress (RAG over their
        enrollments); recommends next course, shows coins balance, nudges incomplete courses,
        explains certificates, suggests games.
      </Bullet>

      <Text style={s.h2}>14. Security</Text>
      <Bullet>RBAC middleware on every API route; role from verified JWT.</Bullet>
      <Bullet>JWT access + refresh (short access, rotating refresh).</Bullet>
      <Bullet>Rate-limit auth + AI; lockout after N failed logins.</Bullet>
      <Bullet>multer: whitelist mime types + size caps. Zod everywhere; sanitize before persist.</Bullet>
      <Bullet>Password reset: hashed one-time tokens, expiry, no enumeration.</Bullet>
      <Bullet>Audit log for all admin/super-admin/agent actions. AI keys server-side only.</Bullet>

      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  );
}

// PART 2 — Build phases step by step --------------------------------------
function BuildOrderPage() {
  const phases: Array<{ title: string; body: string }> = [
    {
      title: "Scaffold",
      body: "Next.js App Router + TypeScript + Tailwind v4 + theme system (dark/light) + responsive shell + folder structure + route groups (public / user / admin / super-admin).",
    },
    {
      title: "Models + DB",
      body: "Mongoose connection, all schemas (incl. full user profile fields) with indexes and validation.",
    },
    {
      title: "Auth",
      body: "Register (+ email verify), login (JWT access/refresh), forgot/reset, RBAC middleware on every API route from a verified JWT.",
    },
    {
      title: "Public site",
      body: "Home, catalog with filters, course detail, contact page — Udemy-style, motion, images, responsive, plain wording.",
    },
    {
      title: "User space",
      body: "Enroll, three learning modes (live online / on-site / self-paced), assessments, certificates, wallet/coins, games, leaderboard, export course PDF.",
    },
    {
      title: "Payments",
      body: "PaymentService + mock gateway (+ Paymee/Konnect/Flouci adapter), card + wallet, partial pay (coins + card).",
    },
    {
      title: "Admin space",
      body: "Manage courses/categories/sessions/users, filters, import XLSX, export users table (Excel + PDF), dashboard.",
    },
    {
      title: "Calendar",
      body: "Trainings calendar (month / week / day) with filters, shared by user + admin views.",
    },
    {
      title: "Super admin space",
      body: "Manage admins, reservations (approval + trainer email), audit log, settings, dashboard.",
    },
    {
      title: "AI layer",
      body: "AIService adapter → User chatbot (Ada) → Admin chatbot (Adi) → Super-admin agent (Avi) with tools + human-in-the-loop + proactive suggestions.",
    },
    {
      title: "i18n",
      body: "English / French / Arabic dictionaries + RTL across web (and mobile).",
    },
    {
      title: "Mobile app",
      body: "Expo React Native TS app consuming the same API (visitor + user scope).",
    },
    {
      title: "Polish + Deploy",
      body: "Animations pass, empty / loading / error states, plain-language copy review, then host (Vercel or PM2/VPS) for a shareable link.",
    },
  ];

  return (
    <Page size="A4" style={s.page}>
      <Header label="Part 2 — Build phases, step by step" />
      <Text style={s.h1}>Part 2 — Build phases (step by step)</Text>
      <Text style={s.muted}>
        Thirteen phases. Verify each one compiles before moving on. Each phase is a complete unit of
        functionality, written as a build-time prompt for the AI coding assistant.
      </Text>

      {phases.map((p, i) => (
        <Step key={i} n={i + 1} title={p.title} body={p.body} />
      ))}

      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  );
}

// PART 3 — Runtime AI prompts ---------------------------------------------
function RuntimePromptsPage() {
  return (
    <Page size="A4" style={s.page}>
      <Header label="Part 3 — Runtime AI prompts" />
      <Text style={s.h1}>Part 3 — Runtime AI prompts</Text>
      <Text style={s.muted}>
        The actual system prompts the platform sends to Anthropic at runtime, one per role.
        Source: src/services/aiService.ts and src/services/agentService.ts.
      </Text>

      <Text style={s.h3}>3.1 — Ada · user learning assistant</Text>
      <PromptCard
        name='"Ada" — user chatbot'
        scope="Scope: user (learner). Source: src/services/aiService.ts"
        body={`You are "Ada", the friendly Advancia Training learning assistant.
You help one specific learner understand their progress, recommend next courses, explain certifications, and answer learning-related questions. You are warm, plain-spoken, and never use jargon.
You have read-only access to the learner's enrollments, coins balance, and certificate history (shown in the context block below). If the user asks something off-topic, gently steer back to learning.
Always reply in the same language the learner is using (English, French, or Arabic). Keep replies short and practical: 2–4 short paragraphs max, with simple lists when useful.

(At runtime, a "--- LEARNER CONTEXT ---" block is appended with the user's name, country, level, wallet coins and the first 20 enrollments with status / progress / completion date.)`}
      />

      <Text style={s.h3}>3.2 — Adi · admin advisory chatbot</Text>
      <PromptCard
        name='"Adi" — admin chatbot'
        scope="Scope: admin. Source: src/services/aiService.ts"
        body={`You are "Adi", the Advancia Training admin assistant. You help platform admins find what to do next: courses missing a category, pending verifications, recent enrollments. You suggest concrete actions and link to relevant pages. You never perform destructive actions; you only advise.`}
      />

      <Text style={s.h3}>3.3 — Avi (lite) · default super-admin chatbot</Text>
      <PromptCard
        name='"Avi" — short version (aiService.ts)'
        scope="Scope: super_admin. Used by the lightweight chatbot endpoint."
        body={`You are "Avi", the Advancia Training operations agent. You help the super admin run the platform. For now, you advise and surface KPIs. Mutating actions require explicit human approval before execution.`}
      />

      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  );
}

function AviAgentPromptPage() {
  return (
    <Page size="A4" style={s.page}>
      <Header label="Part 3 — Runtime AI prompts (cont.)" />

      <Text style={s.h3}>3.4 — Avi (full) · super-admin operations agent</Text>
      <PromptCard
        name='"Avi" — full operations agent (agentService.ts)'
        scope="Scope: super_admin. Source: src/services/agentService.ts. This is the prompt used by the HITL agent route /api/ai/agent (read-only tools auto-execute; mutating tools are returned as proposals)."
        body={`You are "Avi", the operations agent for Advancia Training's super admin.

Your job is to help the super admin run the platform: surface what needs attention, search the catalog, and PROPOSE concrete management actions (create a course, assign a trainer, approve / reject reservations).

Hard rules:
- Read-only tools (get_overview_stats, list_pending_reservations, list_sessions_needing_trainer, search_courses, list_trainers) run immediately. Use them freely to gather context before proposing anything.
- Mutating tools (create_course, assign_trainer_to_session, approve_reservation, reject_reservation) are PROPOSALS — they do not run until the super admin clicks Approve in the UI. Treat each tool_use you emit as a suggestion you're handing over for confirmation.
- Be specific. When you propose, fill in every required field with concrete values you've gathered from read-only tools. Never invent ids — look them up first.
- Be proactive: when the super admin says "what's next?", look at pending reservations + sessions without trainers + KPIs and suggest 2–3 concrete actions with one-line rationales.
- Keep prose short. Bullet what you found, then propose. Pleasantries are fine, but no fluff.

Tone: friendly, fast, direct. You're a power-user copilot, not a chatbot.`}
      />

      <Text style={s.h2}>How the three prompts compose</Text>
      <Bullet>
        Each role's prompt is selected by AiScope (&ldquo;user&rdquo; / &ldquo;admin&rdquo; / &ldquo;super_admin&rdquo;) inside
        streamChat. For the user scope, a learner-context block is concatenated to the system prompt
        before sending — that&rsquo;s the RAG over enrollments.
      </Bullet>
      <Bullet>
        For the super-admin agent, runAgent loops the Anthropic messages.create call, executing
        read-only tools and feeding their results back. The loop exits on the first mutating tool_use,
        which becomes a Proposal returned to the UI. /api/ai/agent/execute then runs the tool and
        writes &ldquo;ai.action_executed&rdquo; to the AuditLog.
      </Bullet>

      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  );
}

function ConventionsPage() {
  return (
    <Page size="A4" style={s.page}>
      <Header label="Appendix — Conventions" />
      <Text style={s.h1}>Appendix — Conventions</Text>
      <Text style={s.muted}>From CLAUDE.md §16, applied at every step.</Text>

      <Bullet>Strict TypeScript, no any without reason. Zod schemas colocated with controllers.</Bullet>
      <Bullet>Server Components by default; &ldquo;use client&rdquo; only when needed.</Bullet>
      <Bullet>Reusable filter, table, KPI-card, and theme components.</Bullet>
      <Bullet>Secrets in .env; provide .env.example. Explain each phase before generating large diffs.</Bullet>
      <Bullet>Keep every user-facing string simple and non-technical (the audience is not IT).</Bullet>

      <Text style={s.h2}>Definition of done, per phase</Text>
      <Bullet>Phase compiles (npm run typecheck + npm run lint + npm run build).</Bullet>
      <Bullet>RBAC is enforced on every new API route.</Bullet>
      <Bullet>Empty / loading / error states are present for every new screen.</Bullet>
      <Bullet>Strings live in src/i18n dictionaries (EN / FR / AR), not inline.</Bullet>
      <Bullet>If a write is performed, an AuditLog row is created.</Bullet>

      <Text style={s.h2}>Hand-off prompt</Text>
      <Para>
        When delegating to another agent or session, restate three things: (a) the phase number and
        its scope, (b) the actor space (public / user / admin / super-admin), (c) the data models
        touched. That&rsquo;s enough context to resume without re-reading the brief.
      </Para>

      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  );
}

// ─────────────────────────── document ───────────────────────────

function PromptsDocument() {
  return (
    <Document
      title="Prompts — Advancia Training Platform"
      author="Advancia Training PFE"
      subject="Build and runtime prompts, step by step"
      creator="advancia-platform"
    >
      <CoverPage />
      <MasterPromptPage />
      <MasterPromptPage2 />
      <MasterPromptPage3 />
      <BuildOrderPage />
      <RuntimePromptsPage />
      <AviAgentPromptPage />
      <ConventionsPage />
    </Document>
  );
}

async function main() {
  const outPath = path.resolve(process.cwd(), "prompt.pdf");
  console.log("→ Rendering prompt.pdf…");
  await renderToFile(<PromptsDocument />, outPath);
  console.log(`✓ Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
