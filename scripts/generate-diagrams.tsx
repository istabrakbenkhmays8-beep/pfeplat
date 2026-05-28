#!/usr/bin/env tsx
/**
 * Generates `diagrams.pdf` at the project root containing the full UML set:
 *   - Cover
 *   - Use case: per-actor (Visitor, User, Admin, Super Admin) + combined index
 *   - Class diagram (domain model, two pages: core + auxiliary)
 *   - Sequence diagrams: 9 flows covering auth, learning, payment, and the AI agent
 *
 * Pure @react-pdf/renderer Svg primitives — no internet, no extra binaries.
 * Run: npm run gen:diagrams
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Rect,
  Line,
  Polygon,
  Ellipse,
  G,
  renderToFile,
} from "@react-pdf/renderer";
import path from "node:path";

// ─────────────────────────── design tokens ───────────────────────────

const BRAND = "#C70019";
const INK = "#111111";
const MUTED = "#5b6470";
const SOFT = "#e5e7eb";
const FILL_BOX = "#fbfbfb";
const FILL_HEAD = "#fde7ec";
const FILL_USECASE = "#fff7f8";
const FILL_LIFELINE = "#f3f4f6";

const FONT = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";
const FONT_OBL = "Helvetica-Oblique";

// ─────────────────────────── shape helpers ───────────────────────────

function ClassBox({
  x,
  y,
  w,
  h,
  title,
  lines = [],
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines?: string[];
}) {
  const headerH = 16;
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} fill={FILL_BOX} stroke={INK} strokeWidth={0.7} />
      <Rect x={x} y={y} width={w} height={headerH} fill={FILL_HEAD} stroke={INK} strokeWidth={0.7} />
      <Text
        x={x + w / 2}
        y={y + 11}
        style={{ fontFamily: FONT_BOLD, fontSize: 8.5, textAnchor: "middle", fill: INK }}
      >
        {title}
      </Text>
      {lines.map((ln, i) => (
        <Text
          key={i}
          x={x + 4}
          y={y + headerH + 9 + i * 8.4}
          style={{ fontFamily: FONT, fontSize: 6.8, fill: INK }}
        >
          {ln}
        </Text>
      ))}
    </G>
  );
}

function Actor({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={6} ry={6} fill="#ffffff" stroke={INK} strokeWidth={0.8} />
      <Line x1={x} y1={y + 6} x2={x} y2={y + 24} stroke={INK} strokeWidth={0.8} />
      <Line x1={x - 9} y1={y + 13} x2={x + 9} y2={y + 13} stroke={INK} strokeWidth={0.8} />
      <Line x1={x} y1={y + 24} x2={x - 8} y2={y + 36} stroke={INK} strokeWidth={0.8} />
      <Line x1={x} y1={y + 24} x2={x + 8} y2={y + 36} stroke={INK} strokeWidth={0.8} />
      <Text
        x={x}
        y={y + 48}
        style={{ fontFamily: FONT_BOLD, fontSize: 8, textAnchor: "middle", fill: INK }}
      >
        {label}
      </Text>
    </G>
  );
}

function UseCase({
  cx,
  cy,
  rx = 60,
  ry = 16,
  label,
}: {
  cx: number;
  cy: number;
  rx?: number;
  ry?: number;
  label: string;
}) {
  return (
    <G>
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={FILL_USECASE} stroke={BRAND} strokeWidth={0.7} />
      <Text
        x={cx}
        y={cy + 3}
        style={{ fontFamily: FONT, fontSize: 7.6, textAnchor: "middle", fill: INK }}
      >
        {label}
      </Text>
    </G>
  );
}

function Assoc({
  x1,
  y1,
  x2,
  y2,
  dashed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
}) {
  return (
    <Line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={MUTED}
      strokeWidth={0.6}
      strokeDasharray={dashed ? "3 2" : undefined}
    />
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  dashed = false,
  color = INK,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
  color?: string;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 6;
  const hx1 = x2 - headLen * Math.cos(angle - Math.PI / 7);
  const hy1 = y2 - headLen * Math.sin(angle - Math.PI / 7);
  const hx2 = x2 - headLen * Math.cos(angle + Math.PI / 7);
  const hy2 = y2 - headLen * Math.sin(angle + Math.PI / 7);
  return (
    <G>
      <Line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={0.8}
        strokeDasharray={dashed ? "3 2" : undefined}
      />
      <Polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} fill={color} stroke={color} />
    </G>
  );
}

function Mult({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <Text x={x} y={y} style={{ fontFamily: FONT, fontSize: 6.6, fill: MUTED, textAnchor: "middle" }}>
      {text}
    </Text>
  );
}

function SeqMsg({
  x1,
  x2,
  y,
  label,
  dashed = false,
  selfCall = false,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  dashed?: boolean;
  selfCall?: boolean;
}) {
  if (selfCall) {
    const xLoop = x1;
    return (
      <G>
        <Line x1={xLoop} y1={y} x2={xLoop + 20} y2={y} stroke={INK} strokeWidth={0.7} />
        <Line x1={xLoop + 20} y1={y} x2={xLoop + 20} y2={y + 10} stroke={INK} strokeWidth={0.7} />
        <Arrow x1={xLoop + 20} y1={y + 10} x2={xLoop + 1} y2={y + 10} />
        <Text x={xLoop + 25} y={y + 6} style={{ fontFamily: FONT, fontSize: 7, fill: INK }}>
          {label}
        </Text>
      </G>
    );
  }
  return (
    <G>
      <Arrow x1={x1} y1={y} x2={x2} y2={y} dashed={dashed} />
      <Text
        x={(x1 + x2) / 2}
        y={y - 3}
        style={{ fontFamily: FONT, fontSize: 7, textAnchor: "middle", fill: INK }}
      >
        {label}
      </Text>
    </G>
  );
}

function Lifeline({
  x,
  y,
  h,
  label,
  width = 110,
}: {
  x: number;
  y: number;
  h: number;
  label: string;
  width?: number;
}) {
  return (
    <G>
      <Rect
        x={x - width / 2}
        y={y}
        width={width}
        height={20}
        fill={FILL_LIFELINE}
        stroke={INK}
        strokeWidth={0.7}
      />
      <Text
        x={x}
        y={y + 13}
        style={{ fontFamily: FONT_BOLD, fontSize: 8, textAnchor: "middle", fill: INK }}
      >
        {label}
      </Text>
      <Line
        x1={x}
        y1={y + 20}
        x2={x}
        y2={y + h}
        stroke={MUTED}
        strokeWidth={0.6}
        strokeDasharray="3 2"
      />
    </G>
  );
}

function SystemBoundary({
  x,
  y,
  w,
  h,
  label,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}) {
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} fill="#ffffff" stroke={MUTED} strokeWidth={0.6} />
      <Text
        x={x + w / 2}
        y={y + 14}
        style={{ fontFamily: FONT_BOLD, fontSize: 9, textAnchor: "middle", fill: MUTED }}
      >
        {label}
      </Text>
    </G>
  );
}

// ─────────────────────────── styles ───────────────────────────

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 30,
    paddingHorizontal: 28,
    fontFamily: FONT,
    fontSize: 10,
    color: INK,
  },
  pageNum: {
    position: "absolute",
    bottom: 14,
    right: 28,
    fontSize: 8,
    color: MUTED,
  },
  topbar: {
    position: "absolute",
    top: 12,
    left: 28,
    right: 28,
    fontSize: 7.5,
    color: MUTED,
    borderBottomWidth: 0.5,
    borderBottomColor: SOFT,
    paddingBottom: 4,
  },
  h1: { fontFamily: FONT_BOLD, fontSize: 18, color: INK, marginTop: 6, marginBottom: 2 },
  h2: { fontFamily: FONT_BOLD, fontSize: 12, color: BRAND, marginTop: 8, marginBottom: 4 },
  sub: { fontSize: 9, color: MUTED, marginBottom: 8 },
  cover: { textAlign: "center", marginTop: 200 },
  coverTitle: { fontFamily: FONT_BOLD, fontSize: 34, color: INK, marginBottom: 6 },
  coverSubtitle: { fontSize: 13, color: MUTED, marginBottom: 2 },
  badge: {
    marginTop: 18,
    alignSelf: "center",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: FILL_HEAD,
    borderRadius: 12,
    fontFamily: FONT_BOLD,
    fontSize: 10,
    color: BRAND,
  },
  toc: { marginTop: 16, fontSize: 10 },
  tocRow: { flexDirection: "row", marginBottom: 4 },
  tocLeft: { flex: 1 },
  tocRight: { color: MUTED, fontSize: 9 },
});

function Topbar({ label }: { label: string }) {
  return <Text style={styles.topbar}>Advancia Training — UML diagrams · {label}</Text>;
}

function PageNum() {
  return <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />;
}

// ─────────────────────────── cover + TOC ───────────────────────────

function CoverPage() {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.cover}>
        <Svg width={140} height={56} viewBox="0 0 140 56" style={{ alignSelf: "center" }}>
          <Ellipse cx={28} cy={28} rx={22} ry={22} fill={BRAND} />
          <Polygon points="22,16 22,40 40,28" fill="#ffffff" />
          <Text x={56} y={34} style={{ fontFamily: FONT_BOLD, fontSize: 22, fill: INK }}>
            ADVANCIA
          </Text>
        </Svg>
        <Text style={styles.coverTitle}>Diagrams</Text>
        <Text style={styles.coverSubtitle}>UML diagrams — use case, class, sequence</Text>
        <Text style={styles.coverSubtitle}>Advancia Training Platform</Text>
        <Text style={styles.badge}>PFE — Final Project</Text>
      </View>
      <View style={styles.toc}>
        <Text style={{ fontFamily: FONT_BOLD, marginBottom: 6 }}>Contents</Text>
        {[
          ["1. Use case — overview of all actors", "Use case"],
          ["1.1 Visitor", "Use case"],
          ["1.2 User (learner)", "Use case"],
          ["1.3 Admin", "Use case"],
          ["1.4 Super Admin", "Use case"],
          ["2. Class diagram — core domain", "Class"],
          ["3. Class diagram — auxiliary entities", "Class"],
          ["4. Sequence — registration + email verify", "Sequence"],
          ["5. Sequence — login (NextAuth credentials)", "Sequence"],
          ["6. Sequence — password reset", "Sequence"],
          ["7. Sequence — browse catalog & enroll", "Sequence"],
          ["8. Sequence — checkout (card + coins)", "Sequence"],
          ["9. Sequence — assessment + certificate", "Sequence"],
          ["10. Sequence — trainer assignment (manual)", "Sequence"],
          ["11. Sequence — super-admin agent (HITL)", "Sequence"],
          ["12. Sequence — AI chatbot streaming", "Sequence"],
        ].map(([l, r], i) => (
          <View key={i} style={styles.tocRow}>
            <Text style={styles.tocLeft}>{l}</Text>
            <Text style={styles.tocRight}>{r}</Text>
          </View>
        ))}
      </View>
      <PageNum />
    </Page>
  );
}

// ─────────────────────────── use case pages ───────────────────────────

function UseCaseOverviewPage() {
  return (
    <Page size={{ width: 842, height: 595 }} style={styles.page} orientation="landscape">
      <Topbar label="1 — Use case overview" />
      <Text style={styles.h1}>1. Use case diagram — overview</Text>
      <Text style={styles.sub}>
        Four primary actors with role inheritance (User ⊇ Visitor; Super Admin ⊇ Admin). Two
        auxiliary actors (AI agent &ldquo;Avi&rdquo;, Email gateway) shown on the right. Detailed per-actor
        diagrams follow.
      </Text>
      <Svg width={786} height={500} viewBox="0 0 786 500">
        <SystemBoundary x={130} y={20} w={520} h={470} label="Advancia Training Platform" />

        <Actor x={70} y={70} label="Visitor" />
        <Actor x={70} y={170} label="User" />
        <Actor x={70} y={290} label="Admin" />
        <Actor x={70} y={410} label="Super Admin" />
        <Actor x={730} y={250} label="AI (Avi)" />
        <Actor x={730} y={400} label="Email gateway" />

        <UseCase cx={250} cy={70} label="Browse catalog" />
        <UseCase cx={380} cy={70} label="View course detail" />
        <UseCase cx={510} cy={70} label="Contact form" />
        <UseCase cx={620} cy={70} label="Register / Login" />

        <UseCase cx={250} cy={130} label="Enroll in course" />
        <UseCase cx={380} cy={130} label="Pay (card / wallet)" />
        <UseCase cx={510} cy={130} label="Take assessment" />
        <UseCase cx={620} cy={130} label="Earn certificate" />

        <UseCase cx={250} cy={180} label="Game-course" />
        <UseCase cx={380} cy={180} label="Earn / spend coins" />
        <UseCase cx={510} cy={180} label="Reserve session" />
        <UseCase cx={620} cy={180} label="Chatbot (Ada)" />

        <UseCase cx={250} cy={260} label="Manage courses" />
        <UseCase cx={380} cy={260} label="Manage sessions" />
        <UseCase cx={510} cy={260} label="Manage users" />
        <UseCase cx={620} cy={260} label="Calendar" />

        <UseCase cx={250} cy={310} label="Import (XLSX)" />
        <UseCase cx={380} cy={310} label="Export users (XLSX/PDF)" />
        <UseCase cx={510} cy={310} label="Admin chatbot (Adi)" />
        <UseCase cx={620} cy={310} label="Admin dashboard" />

        <UseCase cx={250} cy={380} label="Manage admins" />
        <UseCase cx={380} cy={380} label="Approve reservation" />
        <UseCase cx={510} cy={380} label="Assign trainer" />
        <UseCase cx={620} cy={380} label="Send trainer email" />

        <UseCase cx={250} cy={430} label="Audit log" />
        <UseCase cx={380} cy={430} label="Global settings" />
        <UseCase cx={510} cy={430} label="Agent (Avi) — HITL" />
        <UseCase cx={620} cy={430} label="Proactive insights" />

        <Arrow x1={70} y1={150} x2={70} y2={120} dashed color={BRAND} />
        <Text x={78} y={138} style={{ fontFamily: FONT, fontSize: 6.5, fill: BRAND }}>
          {`<<extends Visitor>>`}
        </Text>
        <Arrow x1={70} y1={395} x2={70} y2={330} dashed color={BRAND} />
        <Text x={78} y={365} style={{ fontFamily: FONT, fontSize: 6.5, fill: BRAND }}>
          {`<<extends Admin>>`}
        </Text>

        {[
          [80, 75, 200, 70],
          [80, 75, 330, 70],
          [80, 75, 460, 70],
          [80, 75, 570, 70],
          [80, 175, 200, 130],
          [80, 175, 330, 130],
          [80, 175, 460, 130],
          [80, 175, 570, 130],
          [80, 175, 200, 180],
          [80, 175, 330, 180],
          [80, 175, 460, 180],
          [80, 175, 570, 180],
          [80, 295, 200, 260],
          [80, 295, 330, 260],
          [80, 295, 460, 260],
          [80, 295, 570, 260],
          [80, 295, 200, 310],
          [80, 295, 330, 310],
          [80, 295, 460, 310],
          [80, 295, 570, 310],
          [80, 415, 200, 380],
          [80, 415, 330, 380],
          [80, 415, 460, 380],
          [80, 415, 570, 380],
          [80, 415, 200, 430],
          [80, 415, 330, 430],
          [80, 415, 460, 430],
          [80, 415, 570, 430],
        ].map(([a, b, c, d], i) => (
          <Assoc key={i} x1={a} y1={b} x2={c} y2={d} />
        ))}

        <Assoc x1={720} y1={265} x2={670} y2={180} />
        <Assoc x1={720} y1={265} x2={670} y2={310} />
        <Assoc x1={720} y1={265} x2={670} y2={430} />
        <Assoc x1={720} y1={415} x2={670} y2={380} />
        <Assoc x1={720} y1={415} x2={670} y2={130} />
      </Svg>
      <PageNum />
    </Page>
  );
}

function ActorPage({
  index,
  title,
  hint,
  cases,
  notes,
}: {
  index: string;
  title: string;
  hint: string;
  cases: string[];
  notes?: string;
}) {
  return (
    <Page size={{ width: 842, height: 595 }} style={styles.page} orientation="landscape">
      <Topbar label={`${index} — ${title}`} />
      <Text style={styles.h1}>
        {index} {title}
      </Text>
      <Text style={styles.sub}>{hint}</Text>
      <Svg width={786} height={460} viewBox="0 0 786 460">
        <SystemBoundary x={170} y={20} w={580} h={420} label="Platform" />
        <Actor x={90} y={210} label={title} />

        {cases.map((label, i) => {
          const cols = 3;
          const col = i % cols;
          const row = Math.floor(i / cols);
          const cx = 290 + col * 200;
          const cy = 70 + row * 75;
          return (
            <G key={i}>
              <UseCase cx={cx} cy={cy} label={label} />
              <Assoc x1={100} y1={222} x2={cx - 60} y2={cy} />
            </G>
          );
        })}
        {notes && (
          <Text x={170} y={440} style={{ fontFamily: FONT_OBL, fontSize: 8, fill: MUTED }}>
            {notes}
          </Text>
        )}
      </Svg>
      <PageNum />
    </Page>
  );
}

const visitorCases = [
  "Browse catalog",
  "View course detail",
  "Filter by vendor / domain",
  "Search courses",
  "View public calendar",
  "Submit contact form",
  "Register an account",
  "Sign in",
  "Forgot password",
];

const userCases = [
  "Enroll in a course",
  "Reserve a session",
  "Pay by card",
  "Pay with coins (partial)",
  "Take an assessment",
  "Play a game-course",
  "Earn / spend coins",
  "Download certificate",
  "View leaderboard",
  "Personal calendar",
  "Chat with Ada",
  "Manage profile",
];

const adminCases = [
  "Manage courses",
  "Manage categories",
  "Manage sessions",
  "Manage users",
  "Import users (XLSX)",
  "Export users (XLSX)",
  "Export users (PDF)",
  "Admin dashboard",
  "Calendar (full)",
  "Chat with Adi",
];

const superAdminCases = [
  "Manage admins",
  "Approve reservation",
  "Reject reservation",
  "Assign trainer to session",
  "Send trainer email",
  "Audit log",
  "Global settings",
  "Agent (Avi) — propose actions",
  "Approve / run agent action",
  "Proactive insights",
];

// ─────────────────────────── class diagrams (2 pages) ──────────────

function ClassCorePage() {
  return (
    <Page size={{ width: 842, height: 595 }} style={styles.page} orientation="landscape">
      <Topbar label="2 — Class diagram · core" />
      <Text style={styles.h1}>2. Class diagram — core domain</Text>
      <Text style={styles.sub}>
        Learning core: User, Course, Category, Session, Trainer, Enrollment, Reservation. Mongoose
        unique indexes drive 1..1 cardinalities (unique pairs on Enrollment, Reservation).
      </Text>
      <Svg width={786} height={490} viewBox="0 0 786 490">
        <ClassBox
          x={30}
          y={20}
          w={180}
          h={170}
          title="User"
          lines={[
            "+ firstName, surname",
            "+ email  (unique)",
            "+ passwordHash  (select:false)",
            "+ role: visitor | user |",
            "        admin | super_admin",
            "+ status: pending_verification |",
            "          active | disabled | banned",
            "+ gender, age, country, level",
            "+ walletCoins",
            "+ currentStreak, longestStreak",
            "+ badges[]: { code, awardedAt }",
            "+ avatarUrl, lastLoginAt",
            "+ failedLoginCount, lockedUntil",
            "+ timestamps",
          ]}
        />
        <ClassBox
          x={30}
          y={205}
          w={180}
          h={85}
          title="Category"
          lines={[
            "+ slug  (unique)",
            "+ name",
            "+ vendor  (enum 15 values)",
            "+ group",
            "+ description",
            "+ timestamps",
          ]}
        />
        <ClassBox
          x={30}
          y={300}
          w={180}
          h={95}
          title="Trainer"
          lines={[
            "+ firstName, surname",
            "+ email  (unique)",
            "+ specialty",
            "+ bio, country",
            "+ isActive",
            "+ timestamps",
            "(no login — data only)",
          ]}
        />

        <ClassBox
          x={260}
          y={40}
          w={200}
          h={195}
          title="Course"
          lines={[
            "+ code  (unique, upper)",
            "+ title, summary, description",
            "+ category → Category",
            "+ modes[]: live_online |",
            "           on_site | self_paced",
            "+ level: beginner..expert",
            "+ durationDays",
            "+ priceTnd, coinReward",
            "+ isGame, isFeatured",
            "+ isPublished",
            "+ coverImageUrl",
            "+ learningOutcomes[]",
            "+ prerequisites[]",
            "+ text index (title, code, summary)",
            "+ timestamps",
          ]}
        />

        <ClassBox
          x={500}
          y={40}
          w={180}
          h={150}
          title="Session"
          lines={[
            "+ course → Course",
            "+ trainer → Trainer (optional)",
            "+ mode: live_online | on_site",
            "+ status: draft | scheduled |",
            "          confirmed | in_progress",
            "          | completed | cancelled",
            "+ startsAt, endsAt",
            "+ capacity, enrolledCount",
            "+ location, meetingLink",
            "+ notes",
            "+ timestamps",
          ]}
        />

        <ClassBox
          x={500}
          y={210}
          w={180}
          h={110}
          title="Reservation"
          lines={[
            "+ user → User",
            "+ session → Session",
            "+ status: pending | approved |",
            "          rejected | cancelled |",
            "          attended | no_show",
            "+ reviewedBy → User",
            "+ reviewedAt, reviewNote",
            "+ unique(user, session)",
          ]}
        />

        <ClassBox
          x={260}
          y={260}
          w={200}
          h={140}
          title="Enrollment"
          lines={[
            "+ user → User",
            "+ course → Course",
            "+ status: active | completed |",
            "          abandoned",
            "+ progress (0..100)",
            "+ completedAt",
            "+ coinsAwarded (bool)",
            "+ coinsAwardedAt",
            "+ unique(user, course)",
            "+ timestamps",
          ]}
        />

        {/* relations */}
        <Assoc x1={210} y1={140} x2={260} y2={140} />
        <Mult x={218} y={134} text="1" />
        <Mult x={253} y={134} text="*" />

        <Assoc x1={210} y1={245} x2={260} y2={245} />
        <Mult x={250} y={239} text="course * — 1 Category" />

        <Assoc x1={460} y1={140} x2={500} y2={140} />
        <Mult x={468} y={134} text="1" />
        <Mult x={493} y={134} text="*" />

        <Assoc x1={500} y1={170} x2={210} y2={355} />
        <Mult x={350} y={264} text="Trainer 0..1 — * Session" />

        <Assoc x1={460} y1={325} x2={500} y2={250} />
        <Mult x={440} y={290} text="user * — 1" />

        <Assoc x1={210} y1={100} x2={260} y2={300} />
        <Mult x={234} y={210} text="User 1 — *  Enrollment" />

        <Assoc x1={210} y1={150} x2={500} y2={260} />
        <Mult x={350} y={210} text="User 1 — *  Reservation" />
      </Svg>
      <PageNum />
    </Page>
  );
}

function ClassAuxPage() {
  return (
    <Page size={{ width: 842, height: 595 }} style={styles.page} orientation="landscape">
      <Topbar label="3 — Class diagram · auxiliary" />
      <Text style={styles.h1}>3. Class diagram — auxiliary entities</Text>
      <Text style={styles.sub}>
        Assessment, certification, money, AI, audit, and email tokens. All foreign keys point back to
        User and Course unless noted.
      </Text>
      <Svg width={786} height={490} viewBox="0 0 786 490">
        <ClassBox
          x={30}
          y={20}
          w={200}
          h={150}
          title="Assessment"
          lines={[
            "+ course → Course",
            "+ title, description",
            "+ passThreshold  (0..100)",
            "+ timeLimitMinutes",
            "+ maxAttempts",
            "+ questions[]: {",
            "    prompt, type, options[],",
            "    correctText, points,",
            "    explanation }",
            "+ isPublished",
            "+ timestamps",
          ]}
        />
        <ClassBox
          x={30}
          y={185}
          w={200}
          h={110}
          title="AssessmentResult"
          lines={[
            "+ assessment → Assessment",
            "+ user → User",
            "+ attempt, score",
            "+ passed (bool)",
            "+ answers[]: { questionId,",
            "    selectedOptionIds[], text,",
            "    isCorrect, pointsAwarded }",
            "+ unique(user, assessment, attempt)",
          ]}
        />
        <ClassBox
          x={30}
          y={310}
          w={200}
          h={95}
          title="Certificate"
          lines={[
            "+ user → User",
            "+ course → Course",
            "+ serial  (unique)",
            "+ issuedAt, pdfUrl",
            "+ revokedAt, revokeReason",
            "+ unique(user, course)",
          ]}
        />

        <ClassBox
          x={260}
          y={20}
          w={200}
          h={140}
          title="Payment"
          lines={[
            "+ user → User",
            "+ course → Course",
            "+ enrollment → Enrollment",
            "+ provider: mock | paymee |",
            "            konnect | flouci",
            "+ providerRef, method",
            "+ amountTnd, coinsUsed",
            "+ status: initiated | pending |",
            "          succeeded | failed |",
            "          refunded",
            "+ paidAt, refundedAt",
          ]}
        />
        <ClassBox
          x={260}
          y={175}
          w={200}
          h={120}
          title="CoinTransaction"
          lines={[
            "+ user → User",
            "+ delta  (+ earn / - spend)",
            "+ reason: completion |",
            "  assessment_pass | game_score |",
            "  streak_bonus | admin_grant |",
            "  purchase_discount | refund",
            "+ balanceAfter",
            "+ course, payment refs",
            "+ note",
          ]}
        />
        <ClassBox
          x={260}
          y={310}
          w={200}
          h={95}
          title="EmailToken"
          lines={[
            "+ user → User",
            "+ tokenHash  (unique, SHA-256)",
            "+ type: verify_email |",
            "        reset_password",
            "+ expiresAt  (TTL index)",
            "+ usedAt, ip, userAgent",
          ]}
        />

        <ClassBox
          x={490}
          y={20}
          w={210}
          h={185}
          title="AIConversation"
          lines={[
            "+ user → User",
            "+ scope: user | admin | super_admin",
            "+ title",
            "+ messages[]: {",
            "    role: user | assistant |",
            "          system | tool,",
            "    content,",
            "    toolCalls[]: {",
            "      name, args, result, error,",
            "      approvedBy, approvedAt,",
            "      executedAt }",
            "  }",
            "+ lastMessageAt",
          ]}
        />
        <ClassBox
          x={490}
          y={220}
          w={210}
          h={185}
          title="AuditLog"
          lines={[
            "+ actor → User (optional)",
            "+ actorRole",
            "+ action  (enum 18 values)",
            "  user.created / role_changed",
            "  course.created / updated / pub.",
            "  session.created / confirmed",
            "  trainer.assigned",
            "  reservation.approved / rejected",
            "  payment.captured",
            "  ai.tool_invoked / action_executed",
            "  settings.updated",
            "+ targetType, targetId",
            "+ before, after, metadata",
            "+ ip, userAgent",
            "+ createdAt only (no update)",
          ]}
        />

        <Text
          x={30}
          y={440}
          style={{ fontFamily: FONT_OBL, fontSize: 8, fill: MUTED }}
        >
          References to User and Course (left-side) and to the wider domain (right-side) are by ObjectId;
          AuditLog is the only entity allowed to outlive deleted actors (actor field is optional).
        </Text>
      </Svg>
      <PageNum />
    </Page>
  );
}

// ─────────────────────────── sequence pages ───────────────────────

function SequencePage({
  index,
  title,
  blurb,
  participants,
  messages,
  footnote,
}: {
  index: string;
  title: string;
  blurb: string;
  participants: { x: number; label: string; width?: number }[];
  messages: {
    y: number;
    fromIdx: number;
    toIdx: number;
    label: string;
    dashed?: boolean;
    selfCall?: boolean;
  }[];
  footnote?: string;
}) {
  const lifelineHeight = 460;
  return (
    <Page size={{ width: 842, height: 595 }} style={styles.page} orientation="landscape">
      <Topbar label={`${index} — ${title}`} />
      <Text style={styles.h1}>
        {index} {title}
      </Text>
      <Text style={styles.sub}>{blurb}</Text>
      <Svg width={786} height={500} viewBox="0 0 786 500">
        {participants.map((p, i) => (
          <Lifeline key={i} x={p.x} y={20} h={lifelineHeight} label={p.label} width={p.width} />
        ))}
        {messages.map((m, i) => (
          <SeqMsg
            key={i}
            x1={participants[m.fromIdx].x}
            x2={participants[m.toIdx].x}
            y={m.y}
            label={m.label}
            dashed={m.dashed}
            selfCall={m.selfCall}
          />
        ))}
        {footnote && (
          <Text
            x={participants[0].x - 40}
            y={lifelineHeight + 24}
            style={{ fontFamily: FONT_OBL, fontSize: 7.5, fill: MUTED }}
          >
            {footnote}
          </Text>
        )}
      </Svg>
      <PageNum />
    </Page>
  );
}

// ─────────────────────────── document ───────────────────────────

function DiagramsDocument() {
  return (
    <Document
      title="Diagrams — Advancia Training Platform"
      author="Advancia Training PFE"
      subject="UML diagrams: use case, class, sequence"
      creator="advancia-platform"
    >
      <CoverPage />

      {/* 1 — Use case */}
      <UseCaseOverviewPage />
      <ActorPage
        index="1.1"
        title="Visitor"
        hint="Unauthenticated browser of the public site."
        cases={visitorCases}
        notes="Visitors cannot enroll, pay, take assessments, or use the AI. They can register to become a User."
      />
      <ActorPage
        index="1.2"
        title="User"
        hint="A signed-in learner. Inherits every Visitor use case."
        cases={userCases}
        notes="The user-side AI chatbot &ldquo;Ada&rdquo; uses RAG over the learner's enrollments and wallet to suggest the next step."
      />
      <ActorPage
        index="1.3"
        title="Admin"
        hint="Day-to-day platform operator. Manages content + people but cannot manage admins or run agent actions."
        cases={adminCases}
        notes="The admin chatbot &ldquo;Adi&rdquo; is advisory-only — it can surface pending items and link to pages but never mutates data."
      />
      <ActorPage
        index="1.4"
        title="Super Admin"
        hint="Highest privilege. Inherits every Admin use case plus governance and the operations agent."
        cases={superAdminCases}
        notes="Mutating agent actions are proposals — the super admin must click Approve before they run. Both the proposal and the execution are written to AuditLog."
      />

      {/* 2-3 — Class */}
      <ClassCorePage />
      <ClassAuxPage />

      {/* 4 — Registration */}
      <SequencePage
        index="4."
        title="Sequence — Registration + email verification"
        blurb="POST /api/auth/register → Zod validate → bcrypt(password, 10) → User(status=pending_verification) → EmailToken (SHA-256 hash, 30-min TTL) → emailService.sendVerification → SMTP. The user clicks the emailed link to activate."
        participants={[
          { x: 70, label: "Visitor" },
          { x: 210, label: "/api/auth/register" },
          { x: 360, label: "User repo" },
          { x: 500, label: "EmailToken" },
          { x: 640, label: "emailService" },
          { x: 750, label: "SMTP", width: 70 },
        ]}
        messages={[
          { y: 70, fromIdx: 0, toIdx: 1, label: "POST /register {email,pwd}" },
          { y: 100, fromIdx: 1, toIdx: 2, label: "Zod validate → findByEmail" },
          { y: 120, fromIdx: 2, toIdx: 1, label: "null", dashed: true },
          { y: 145, fromIdx: 1, toIdx: 1, label: "bcrypt.hash(pwd, 10)", selfCall: true },
          { y: 180, fromIdx: 1, toIdx: 2, label: "create(User, status=pending_verification)" },
          { y: 205, fromIdx: 2, toIdx: 1, label: "user._id", dashed: true },
          { y: 230, fromIdx: 1, toIdx: 3, label: "createHashed(token, type=verify_email)" },
          { y: 255, fromIdx: 3, toIdx: 1, label: "rawToken", dashed: true },
          { y: 280, fromIdx: 1, toIdx: 4, label: "sendVerification(email, link)" },
          { y: 305, fromIdx: 4, toIdx: 5, label: "nodemailer.sendMail" },
          { y: 330, fromIdx: 5, toIdx: 4, label: "message-id", dashed: true },
          { y: 355, fromIdx: 4, toIdx: 1, label: "ok", dashed: true },
          { y: 380, fromIdx: 1, toIdx: 0, label: "201 Created", dashed: true },
        ]}
        footnote="Then: GET /verify?token=… → look up EmailToken by SHA-256(token) → mark usedAt → User.status = active. Token TTL index auto-deletes expired tokens."
      />

      {/* 5 — Login */}
      <SequencePage
        index="5."
        title="Sequence — Login (NextAuth credentials)"
        blurb="JWT strategy. Credentials provider checks bcrypt, increments a failed counter on miss, and locks the account temporarily after N failures."
        participants={[
          { x: 70, label: "User" },
          { x: 230, label: "/api/auth/[...nextauth]" },
          { x: 410, label: "User repo" },
          { x: 580, label: "bcrypt" },
          { x: 720, label: "JWT (jose)", width: 90 },
        ]}
        messages={[
          { y: 70, fromIdx: 0, toIdx: 1, label: "POST signIn {email, pwd}" },
          { y: 95, fromIdx: 1, toIdx: 2, label: "findByEmail.select(+passwordHash)" },
          { y: 120, fromIdx: 2, toIdx: 1, label: "user (or null)", dashed: true },
          { y: 145, fromIdx: 1, toIdx: 1, label: "if !user → 401", selfCall: true },
          { y: 180, fromIdx: 1, toIdx: 1, label: "if status≠active or locked → 403", selfCall: true },
          { y: 215, fromIdx: 1, toIdx: 3, label: "compare(pwd, user.passwordHash)" },
          { y: 240, fromIdx: 3, toIdx: 1, label: "boolean", dashed: true },
          { y: 265, fromIdx: 1, toIdx: 1, label: "on fail: failedLoginCount++, maybe lockedUntil", selfCall: true },
          { y: 305, fromIdx: 1, toIdx: 4, label: "encode JWT {sub, role}" },
          { y: 330, fromIdx: 4, toIdx: 1, label: "token", dashed: true },
          { y: 355, fromIdx: 1, toIdx: 2, label: "update lastLoginAt, reset failedLoginCount" },
          { y: 385, fromIdx: 1, toIdx: 0, label: "200 OK + Set-Cookie (httpOnly)", dashed: true },
        ]}
      />

      {/* 6 — Password reset */}
      <SequencePage
        index="6."
        title="Sequence — Password reset (no enumeration)"
        blurb="Forgot → always reply &ldquo;if this email exists, a link was sent&rdquo;. Reset → hashed one-time token, single-use, expiry."
        participants={[
          { x: 70, label: "User" },
          { x: 220, label: "/api/auth/forgot" },
          { x: 360, label: "User repo" },
          { x: 500, label: "EmailToken" },
          { x: 640, label: "emailService" },
          { x: 750, label: "/auth/reset", width: 70 },
        ]}
        messages={[
          { y: 70, fromIdx: 0, toIdx: 1, label: "POST {email}" },
          { y: 95, fromIdx: 1, toIdx: 2, label: "findByEmail" },
          { y: 120, fromIdx: 2, toIdx: 1, label: "user | null", dashed: true },
          { y: 145, fromIdx: 1, toIdx: 1, label: "if !user → silently no-op", selfCall: true },
          { y: 180, fromIdx: 1, toIdx: 3, label: "createHashed(token, type=reset_password, 15min)" },
          { y: 205, fromIdx: 3, toIdx: 1, label: "rawToken", dashed: true },
          { y: 230, fromIdx: 1, toIdx: 4, label: "sendPasswordReset(link)" },
          { y: 255, fromIdx: 1, toIdx: 0, label: "200 (same response regardless)", dashed: true },

          { y: 305, fromIdx: 0, toIdx: 5, label: "click email link → /auth/reset?token=…" },
          { y: 330, fromIdx: 5, toIdx: 3, label: "find by SHA-256(token), check expiresAt" },
          { y: 360, fromIdx: 3, toIdx: 5, label: "valid token", dashed: true },
          { y: 385, fromIdx: 5, toIdx: 2, label: "set new passwordHash, mark token usedAt" },
          { y: 415, fromIdx: 5, toIdx: 0, label: "200 → redirect /auth/login", dashed: true },
        ]}
      />

      {/* 7 — Browse + enroll */}
      <SequencePage
        index="7."
        title="Sequence — Browse catalog & enroll"
        blurb="Filtered catalog search with full-text + vendor/group filters, then POST /api/enrollments. Free courses enroll immediately; paid courses redirect to checkout."
        participants={[
          { x: 80, label: "User" },
          { x: 230, label: "/catalog (RSC)" },
          { x: 380, label: "courseRepo" },
          { x: 530, label: "/api/enrollments" },
          { x: 680, label: "enrollmentService" },
          { x: 770, label: "Mongo", width: 60 },
        ]}
        messages={[
          { y: 70, fromIdx: 0, toIdx: 1, label: "GET /catalog?q=…&vendor=…" },
          { y: 95, fromIdx: 1, toIdx: 2, label: "searchCatalog(filters)" },
          { y: 120, fromIdx: 2, toIdx: 5, label: "Course.find + populate(Category) + withNextSession" },
          { y: 150, fromIdx: 5, toIdx: 2, label: "courses[]", dashed: true },
          { y: 175, fromIdx: 2, toIdx: 1, label: "CatalogCourse[]", dashed: true },
          { y: 200, fromIdx: 1, toIdx: 0, label: "HTML page (RSC streamed)", dashed: true },

          { y: 250, fromIdx: 0, toIdx: 3, label: "click Enroll → POST {courseCode}" },
          { y: 275, fromIdx: 3, toIdx: 4, label: "enroll(userId, courseCode)" },
          { y: 300, fromIdx: 4, toIdx: 5, label: "Course.findOne({code})" },
          { y: 325, fromIdx: 5, toIdx: 4, label: "course", dashed: true },
          { y: 350, fromIdx: 4, toIdx: 4, label: "if priceTnd > 0 → return needsPayment", selfCall: true },
          { y: 390, fromIdx: 4, toIdx: 5, label: "Enrollment.create(user, course, status=active)" },
          { y: 415, fromIdx: 4, toIdx: 3, label: "{enrollmentId}", dashed: true },
          { y: 440, fromIdx: 3, toIdx: 0, label: "redirect /my-courses or /checkout", dashed: true },
        ]}
      />

      {/* 8 — Checkout */}
      <SequencePage
        index="8."
        title="Sequence — Checkout (card + coins)"
        blurb="Partial payment: amountTnd − discount(coinsUsed). On success the system writes Payment + Enrollment + CoinTransaction in a single transaction; the coin-completion reward is awarded only once, separately."
        participants={[
          { x: 60, label: "User" },
          { x: 185, label: "/api/checkout" },
          { x: 310, label: "paymentService" },
          { x: 440, label: "Course repo" },
          { x: 570, label: "Gateway adapter" },
          { x: 710, label: "Mongo (txn)", width: 110 },
        ]}
        messages={[
          { y: 70, fromIdx: 0, toIdx: 1, label: "POST {courseCode, method, coinsUsed}" },
          { y: 95, fromIdx: 1, toIdx: 2, label: "checkout(input)" },
          { y: 120, fromIdx: 2, toIdx: 3, label: "Course.findByCode" },
          { y: 145, fromIdx: 3, toIdx: 2, label: "course", dashed: true },
          { y: 170, fromIdx: 2, toIdx: 2, label: "validate: coinsUsed ≤ wallet & ≤ price", selfCall: true },
          { y: 205, fromIdx: 2, toIdx: 2, label: "amountToCharge = price − discount(coinsUsed)", selfCall: true },
          { y: 245, fromIdx: 2, toIdx: 4, label: "charge(amount, providerRef)" },
          { y: 270, fromIdx: 4, toIdx: 2, label: "{status, providerRef}", dashed: true },
          { y: 295, fromIdx: 2, toIdx: 5, label: "create Payment(status=succeeded)" },
          { y: 315, fromIdx: 2, toIdx: 5, label: "upsert Enrollment(user, course)" },
          { y: 335, fromIdx: 2, toIdx: 5, label: "insert CoinTransaction(-coinsUsed, purchase_discount)" },
          { y: 355, fromIdx: 2, toIdx: 5, label: "User.walletCoins -= coinsUsed" },
          { y: 380, fromIdx: 5, toIdx: 2, label: "ok (atomic)", dashed: true },
          { y: 405, fromIdx: 2, toIdx: 1, label: "{paymentId, enrollmentId}", dashed: true },
          { y: 430, fromIdx: 1, toIdx: 0, label: "200 → redirect /my-courses", dashed: true },
        ]}
      />

      {/* 9 — Assessment + cert */}
      <SequencePage
        index="9."
        title="Sequence — Assessment + certificate issuance"
        blurb="Submit assessment → grade → on pass: certificate.create + reward CoinTransaction (idempotent via coinsAwarded flag). Certificate PDF rendered on demand."
        participants={[
          { x: 60, label: "User" },
          { x: 190, label: "/assessment/[code]" },
          { x: 340, label: "/api/assessments/submit" },
          { x: 490, label: "assessmentService" },
          { x: 620, label: "certificateService" },
          { x: 750, label: "Mongo + PDF", width: 80 },
        ]}
        messages={[
          { y: 70, fromIdx: 0, toIdx: 1, label: "GET — load questions" },
          { y: 95, fromIdx: 1, toIdx: 0, label: "QuizRunner mounted", dashed: true },
          { y: 130, fromIdx: 0, toIdx: 2, label: "POST {assessmentId, answers[]}" },
          { y: 155, fromIdx: 2, toIdx: 3, label: "grade(answers)" },
          { y: 180, fromIdx: 3, toIdx: 5, label: "AssessmentResult.create(attempt, score, passed)" },
          { y: 205, fromIdx: 3, toIdx: 2, label: "{score, passed}", dashed: true },
          { y: 235, fromIdx: 2, toIdx: 2, label: "if !passed → 200 with retry hint", selfCall: true },
          { y: 275, fromIdx: 2, toIdx: 4, label: "if passed → issueCertificate(user, course)" },
          { y: 300, fromIdx: 4, toIdx: 5, label: "Enrollment: if !coinsAwarded → grant coinReward" },
          { y: 320, fromIdx: 4, toIdx: 5, label: "CoinTransaction(+coinReward, assessment_pass)" },
          { y: 340, fromIdx: 4, toIdx: 5, label: "Certificate.create(serial=ADV-cert-…)" },
          { y: 365, fromIdx: 4, toIdx: 2, label: "{certificateId}", dashed: true },
          { y: 390, fromIdx: 2, toIdx: 0, label: "200 {passed, certificateId}", dashed: true },
          { y: 425, fromIdx: 0, toIdx: 1, label: "GET /certificates → pdf link" },
          { y: 450, fromIdx: 1, toIdx: 5, label: "render @react-pdf/renderer → stream", dashed: true },
        ]}
      />

      {/* 10 — Manual trainer assignment */}
      <SequencePage
        index="10."
        title="Sequence — Manual trainer assignment (super admin UI)"
        blurb="POST /api/super-admin/sessions/[id]/assign-trainer → update Session.trainer → email the trainer (date/time, location/link, course, enrolledCount) → AuditLog."
        participants={[
          { x: 70, label: "Super Admin" },
          { x: 230, label: "/super-admin/sessions" },
          { x: 400, label: "trainerService" },
          { x: 540, label: "Mongo" },
          { x: 660, label: "emailService" },
          { x: 770, label: "SMTP", width: 60 },
        ]}
        messages={[
          { y: 70, fromIdx: 0, toIdx: 1, label: "click Assign → POST {sessionId, trainerId}" },
          { y: 95, fromIdx: 1, toIdx: 2, label: "assignTrainer(sessionId, trainerId, actor)" },
          { y: 120, fromIdx: 2, toIdx: 3, label: "Session.findById(sessionId).populate(course)" },
          { y: 145, fromIdx: 3, toIdx: 2, label: "session", dashed: true },
          { y: 170, fromIdx: 2, toIdx: 3, label: "Trainer.findById(trainerId)" },
          { y: 195, fromIdx: 3, toIdx: 2, label: "trainer", dashed: true },
          { y: 225, fromIdx: 2, toIdx: 3, label: "Session.update(trainer=trainerId, status=confirmed)" },
          { y: 255, fromIdx: 2, toIdx: 4, label: "sendTrainerNotice({trainer, session, course, enrolledCount})" },
          { y: 280, fromIdx: 4, toIdx: 5, label: "nodemailer.sendMail" },
          { y: 305, fromIdx: 5, toIdx: 4, label: "message-id", dashed: true },
          { y: 330, fromIdx: 4, toIdx: 2, label: "ok", dashed: true },
          { y: 355, fromIdx: 2, toIdx: 3, label: "AuditLog: trainer.assigned (before/after)" },
          { y: 385, fromIdx: 2, toIdx: 1, label: "{sessionId, trainer}", dashed: true },
          { y: 410, fromIdx: 1, toIdx: 0, label: "200 → toast 'Trainer notified'", dashed: true },
        ]}
      />

      {/* 11 — Super-admin agent HITL */}
      <SequencePage
        index="11."
        title="Sequence — Super-admin agent (Avi) — HITL"
        blurb="Read-only tools auto-execute and feed back into the model loop (max 8 hops). The first MUTATING tool_use stops the loop and is returned as a Proposal; the super admin Approves before /execute fires it. Both invocation and execution are audited."
        participants={[
          { x: 60, label: "Super Admin" },
          { x: 185, label: "/api/ai/agent" },
          { x: 310, label: "agentService" },
          { x: 440, label: "Anthropic API" },
          { x: 570, label: "agentTools" },
          { x: 710, label: "Mongo + email", width: 110 },
        ]}
        messages={[
          { y: 70, fromIdx: 0, toIdx: 1, label: 'POST "what should I do next?"' },
          { y: 95, fromIdx: 1, toIdx: 2, label: "runAgent(history, msg, actorId)" },
          { y: 120, fromIdx: 2, toIdx: 3, label: "messages.create(tools=…)" },
          { y: 145, fromIdx: 3, toIdx: 2, label: "tool_use: list_pending_reservations", dashed: true },
          { y: 170, fromIdx: 2, toIdx: 4, label: "execute (read-only)" },
          { y: 195, fromIdx: 4, toIdx: 5, label: "query Reservation/Session" },
          { y: 220, fromIdx: 5, toIdx: 2, label: "results", dashed: true },
          { y: 245, fromIdx: 2, toIdx: 5, label: "AuditLog: ai.tool_invoked" },
          { y: 270, fromIdx: 2, toIdx: 3, label: "tool_result → continue loop" },
          { y: 295, fromIdx: 3, toIdx: 2, label: "tool_use: assign_trainer_to_session (MUTATING)", dashed: true },
          { y: 320, fromIdx: 2, toIdx: 2, label: "stop loop, build Proposal{name,input,toolUseId,resumeContext}", selfCall: true },
          { y: 360, fromIdx: 2, toIdx: 1, label: "{reply, proposals[]}", dashed: true },
          { y: 385, fromIdx: 1, toIdx: 0, label: 'renders "Show arguments" + Approve', dashed: true },
          { y: 415, fromIdx: 0, toIdx: 1, label: "POST /api/ai/agent/execute {proposalId}" },
          { y: 440, fromIdx: 1, toIdx: 2, label: "executeProposal" },
          { y: 460, fromIdx: 2, toIdx: 5, label: "trainerService.assign → emailService.sendTrainerNotice" },
          { y: 480, fromIdx: 5, toIdx: 0, label: "200 + AuditLog: ai.action_executed", dashed: true },
        ]}
      />

      {/* 12 — AI streaming */}
      <SequencePage
        index="12."
        title="Sequence — AI chatbot streaming (Ada — user)"
        blurb="One AIService adapter, three scopes. For the user scope a learner-context block is concatenated to the system prompt (RAG over enrollments). Response is streamed via Server-Sent Events; both messages are persisted to AIConversation."
        participants={[
          { x: 60, label: "User" },
          { x: 200, label: "ChatWidget (RSC)" },
          { x: 340, label: "/api/ai/chat" },
          { x: 470, label: "aiService" },
          { x: 600, label: "Anthropic API" },
          { x: 740, label: "AIConversation", width: 100 },
        ]}
        messages={[
          { y: 70, fromIdx: 0, toIdx: 1, label: "type message, press Enter" },
          { y: 95, fromIdx: 1, toIdx: 2, label: "POST {scope:'user', history, message}" },
          { y: 120, fromIdx: 2, toIdx: 3, label: "ensureConversation(userId, scope)" },
          { y: 145, fromIdx: 3, toIdx: 5, label: "find-or-create AIConversation", dashed: true },
          { y: 170, fromIdx: 2, toIdx: 3, label: "streamChat({scope, userId, history})" },
          { y: 200, fromIdx: 3, toIdx: 3, label: "buildUserContext(userId): user + first 20 enrollments", selfCall: true },
          { y: 235, fromIdx: 3, toIdx: 4, label: "messages.stream({system, model, messages})" },
          { y: 270, fromIdx: 4, toIdx: 3, label: "text delta chunks…", dashed: true },
          { y: 295, fromIdx: 3, toIdx: 2, label: "pipe chunks (SSE)", dashed: true },
          { y: 320, fromIdx: 2, toIdx: 1, label: "stream chunks (text/event-stream)", dashed: true },
          { y: 345, fromIdx: 1, toIdx: 0, label: "incremental render", dashed: true },
          { y: 380, fromIdx: 4, toIdx: 3, label: "message_stop", dashed: true },
          { y: 405, fromIdx: 3, toIdx: 5, label: "appendMessages(conv, [user, assistant])" },
          { y: 430, fromIdx: 2, toIdx: 1, label: "stream end", dashed: true },
        ]}
        footnote="Admin scope uses the same path with Adi's system prompt — no context block. Super-admin scope skips streamChat and uses runAgent for tool-use loops (see §11)."
      />
    </Document>
  );
}

async function main() {
  const outPath = path.resolve(process.cwd(), "diagrams.pdf");
  console.log("→ Rendering diagrams.pdf…");
  await renderToFile(<DiagramsDocument />, outPath);
  console.log(`✓ Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
