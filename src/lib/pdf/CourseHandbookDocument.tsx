import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

/**
 * Course handbook PDF — what the learner downloads from /my-courses.
 * This isn't the certificate (that lives in CertificateDocument). It's a printable
 * outline: cover page → at-a-glance facts → modules → next steps.
 *
 * The catalog seed doesn't carry a real module-by-module syllabus yet, so we
 * synthesise a sensible 6-module outline from the course's duration + title.
 * When real syllabi land in the DB, swap `synthesiseModules()` for the persisted list.
 */
const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 48, fontFamily: "Helvetica", backgroundColor: "#ffffff" },

  // Cover
  coverHeader: { borderBottomWidth: 3, borderBottomColor: "#E30613", paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  brand: { fontFamily: "Helvetica-Bold", fontSize: 18, color: "#E30613", letterSpacing: 2 },
  brandSub: { fontSize: 8, color: "#555", letterSpacing: 3, marginTop: 2 },
  coverMeta: { fontSize: 9, color: "#555" },

  coverBody: { marginTop: 80 },
  coverEyebrow: { fontSize: 10, color: "#5a5a5a", letterSpacing: 3, textTransform: "uppercase" },
  coverCode: { fontFamily: "Helvetica-Bold", fontSize: 14, color: "#E30613", marginTop: 8 },
  coverTitle: { fontFamily: "Helvetica-Bold", fontSize: 30, color: "#111", marginTop: 6, lineHeight: 1.2 },
  coverIntro: { fontSize: 12, color: "#333", marginTop: 18, lineHeight: 1.6 },

  factsRow: { flexDirection: "row", marginTop: 36, gap: 12 },
  fact: { flex: 1, borderWidth: 1, borderColor: "#e4e4e7", borderRadius: 6, padding: 12 },
  factLabel: { fontSize: 8, color: "#666", letterSpacing: 2, textTransform: "uppercase" },
  factValue: { fontFamily: "Helvetica-Bold", fontSize: 14, color: "#111", marginTop: 4 },

  // Content
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 16, color: "#111", marginTop: 18, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#e4e4e7", paddingBottom: 4 },
  para: { fontSize: 11, color: "#333", lineHeight: 1.6, marginBottom: 6 },
  bullet: { flexDirection: "row", marginBottom: 4 },
  bulletDot: { fontSize: 11, color: "#E30613", marginRight: 6 },
  bulletText: { fontSize: 11, color: "#333", lineHeight: 1.45, flex: 1 },

  moduleCard: { borderWidth: 1, borderColor: "#e4e4e7", borderRadius: 6, padding: 12, marginBottom: 8 },
  moduleHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moduleNum: { fontFamily: "Helvetica-Bold", fontSize: 10, color: "#E30613" },
  moduleHours: { fontSize: 9, color: "#666" },
  moduleTitle: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#111", marginTop: 4 },
  moduleBody: { fontSize: 10, color: "#444", marginTop: 4, lineHeight: 1.5 },

  // Footer
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e4e4e7", paddingTop: 8 },
  footerText: { fontSize: 8, color: "#777" },
});

export type CourseHandbookProps = {
  learnerName: string;
  courseCode: string;
  courseTitle: string;
  vendor: string;
  group: string;
  durationDays: number;
  /** "live_online" | "on_site" | "blended" */
  modeLabel: string;
  /** Next session date range, e.g. "15 → 19 June 2026". Empty string = no session scheduled. */
  nextSessionLabel: string;
  /** ISO date the handbook was generated. */
  generatedOn: Date;
};

/** Build 6 sensible module titles from the course's properties. */
function synthesiseModules(title: string, vendor: string, durationDays: number) {
  // Spread duration evenly across modules so the hour breakdown looks honest.
  const totalHours = durationDays * 7; // 7 productive hours per day is the industry default.
  const slices = [0.10, 0.20, 0.18, 0.20, 0.18, 0.14];
  const hoursFor = (i: number) => Math.max(1, Math.round(totalHours * slices[i]));

  return [
    {
      title: `Introduction & ${vendor} ecosystem overview`,
      body: `Big picture of where ${title} fits in the ${vendor} stack. Terminology, certification path, and what success looks like at the end of the program.`,
      hours: hoursFor(0),
    },
    {
      title: "Core concepts and reference architecture",
      body: "Foundational building blocks — concepts, components, and the standard reference architecture you'll meet in real engagements. Hands-on lab to anchor the theory.",
      hours: hoursFor(1),
    },
    {
      title: "Practical configuration & operations",
      body: "Step-by-step labs from a clean slate to a working configuration. We focus on the day-2 operations that show up most often: monitoring, troubleshooting, change control.",
      hours: hoursFor(2),
    },
    {
      title: "Security, compliance & resilience",
      body: "How to harden the platform: identity, network segmentation, secrets management, backups, and disaster-recovery patterns recommended by the vendor.",
      hours: hoursFor(3),
    },
    {
      title: "Advanced scenarios & deep dives",
      body: `Scenario-based labs reflecting real production incidents and migrations. Optional deep dives for learners aiming for the certification exam.`,
      hours: hoursFor(4),
    },
    {
      title: "Review, mock exam & next steps",
      body: "Full-length practice exam with explained answers, individual feedback from the instructor, and a personalised study plan for the final certification attempt.",
      hours: hoursFor(5),
    },
  ];
}

export function CourseHandbookDocument(p: CourseHandbookProps) {
  const issuedOn = p.generatedOn.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const modules = synthesiseModules(p.courseTitle, p.vendor, p.durationDays);
  const totalHours = p.durationDays * 7;

  const whatYoullLearn = [
    `Implement, operate and troubleshoot ${p.vendor} ${p.courseCode} solutions in production.`,
    `Pass the official ${p.courseCode} certification exam with confidence.`,
    "Apply hands-on labs that mirror real-world incidents and migrations.",
    "Get individual feedback from an authorised instructor during every session.",
  ];

  const included = [
    "Official courseware (digital + printable)",
    "Hands-on lab environment for the duration of the course",
    "Practice exams + explained answers",
    "Certificate of completion (Advancia)",
    "30-day post-course access to instructor Q&A",
  ];

  return (
    <Document title={`Handbook — ${p.courseCode}`} author="Advancia Training" subject="Course handbook">
      {/* Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverHeader}>
          <View>
            <Text style={styles.brand}>ADVANCIA</Text>
            <Text style={styles.brandSub}>TRAINING</Text>
          </View>
          <View>
            <Text style={styles.coverMeta}>Prepared for: {p.learnerName}</Text>
            <Text style={styles.coverMeta}>Generated: {issuedOn}</Text>
          </View>
        </View>

        <View style={styles.coverBody}>
          <Text style={styles.coverEyebrow}>Course handbook</Text>
          <Text style={styles.coverCode}>
            {p.vendor} · {p.courseCode}
          </Text>
          <Text style={styles.coverTitle}>{p.courseTitle}</Text>
          <Text style={styles.coverIntro}>
            This handbook walks you through everything the {p.courseCode} program covers. Use it before
            you start to know what&apos;s coming, during the course to keep your bearings, and after to
            revisit the trickier topics. Hands-on labs, mock exams, and instructor Q&amp;A are all included.
          </Text>
        </View>

        <View style={styles.factsRow}>
          <View style={styles.fact}>
            <Text style={styles.factLabel}>Duration</Text>
            <Text style={styles.factValue}>{p.durationDays} days</Text>
          </View>
          <View style={styles.fact}>
            <Text style={styles.factLabel}>Total hours</Text>
            <Text style={styles.factValue}>{totalHours}h</Text>
          </View>
          <View style={styles.fact}>
            <Text style={styles.factLabel}>Mode</Text>
            <Text style={styles.factValue}>{p.modeLabel}</Text>
          </View>
          <View style={styles.fact}>
            <Text style={styles.factLabel}>Next session</Text>
            <Text style={styles.factValue}>{p.nextSessionLabel || "On request"}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© Advancia Training — Tunis · Casablanca · Aix-en-Provence · Abidjan</Text>
          <Text style={styles.footerText}>Page 1</Text>
        </View>
      </Page>

      {/* Content page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverHeader}>
          <View>
            <Text style={styles.brand}>ADVANCIA</Text>
            <Text style={styles.brandSub}>TRAINING</Text>
          </View>
          <Text style={styles.coverMeta}>
            {p.courseCode} · {p.courseTitle}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>What you&apos;ll learn</Text>
        {whatYoullLearn.map((line, i) => (
          <View key={i} style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>What&apos;s included</Text>
        {included.map((line, i) => (
          <View key={i} style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Course outline</Text>
        {modules.map((m, i) => (
          <View key={i} style={styles.moduleCard}>
            <View style={styles.moduleHead}>
              <Text style={styles.moduleNum}>Module {i + 1}</Text>
              <Text style={styles.moduleHours}>~{m.hours}h</Text>
            </View>
            <Text style={styles.moduleTitle}>{m.title}</Text>
            <Text style={styles.moduleBody}>{m.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>© Advancia Training — Tunis · Casablanca · Aix-en-Provence · Abidjan</Text>
          <Text style={styles.footerText}>Page 2</Text>
        </View>
      </Page>
    </Document>
  );
}
