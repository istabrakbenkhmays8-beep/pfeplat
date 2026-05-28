/**
 * Seed data extracted from `reference/planning-formation-juin-2026.pdf`.
 *
 * This is the source-of-truth for the initial catalog. Phase 2 will import these
 * arrays from the database seeder. The S1 2026 catalog (Calendrier-formations-s1-2026.pdf)
 * holds more courses across the full semester and will be ingested separately later.
 */

export type Vendor =
  | "Cisco"
  | "Fortinet"
  | "Microsoft"
  | "PaloAlto"
  | "IBM"
  | "EC-Council"
  | "PECB"
  | "PeopleCert"
  | "PMI"
  | "Togaf"
  | "Linux";

export type CourseCategory = {
  slug: string;
  name: string;
  vendor: Vendor;
  group: string;
};

export type CourseSeed = {
  code: string;
  title: string;
  durationDays: number;
  categorySlug: string;
  /** ISO dates of the next scheduled session (June 2026). */
  juneSession?: { start: string; end: string };
};

/**
 * Realistic Tunisian-market pricing per course code.
 * Calibrated against the Advancia 2026 brochure: foundation courses sit around 350 DT/day,
 * mid-tier pro certs around 450-500 DT/day, premium certs (PMP, ISO 27001, AZ-500) around 550-650 DT/day.
 * coinReward scales with price so a course always returns ~12-15% of its cost back as a goodwill credit.
 */
type Tier = "foundation" | "standard" | "professional" | "premium" | "specialist";

const TIER: Record<string, Tier> = {
  // Premium — flagship certs you'd put on a CV
  PMP: "premium",
  CCNA: "premium",
  ISO27001LI: "premium",
  "AZ-500": "premium",
  CSA: "premium",

  // Professional — strong technical track
  ENARSI: "professional",
  DCCOR: "professional",
  DCIT: "professional",
  SSNGFW: "professional",
  SISE: "professional",
  DEVOPS: "professional",
  "AZ-104": "professional",
  "AZ-204": "professional",
  "PL-500": "professional",
  "DP-500": "professional",
  "WS-011": "professional",
  AN62G: "professional",

  // Standard — common admin / specialist roles
  NSE4: "standard",
  SESA: "standard",
  ATLP1: "standard",
  "PL-300": "standard",
  "DP-100": "standard",
  "M-552383": "standard",
  "EDU-330": "standard",
  AN22G: "standard",

  // Foundation — entry-level, short
  SCRUM: "foundation",
  ITILF: "foundation",
  "SC-400": "foundation",
  "TOGAF-F": "foundation",
  "TOGAF-P": "foundation",
};

const PER_DAY_BY_TIER: Record<Tier, number> = {
  foundation: 350,
  standard: 450,
  professional: 550,
  premium: 650,
  specialist: 500,
};

/** Round prices to nearest 50 DT for a cleaner storefront. */
function roundTo50(n: number): number {
  return Math.round(n / 50) * 50;
}

export function priceForCourse(code: string, durationDays: number): number {
  const tier = TIER[code] ?? "standard";
  return roundTo50(durationDays * PER_DAY_BY_TIER[tier]);
}

export function coinRewardForCourse(code: string, durationDays: number): number {
  // ~13% of price returned as coins, rounded to nearest 10 for tidiness.
  const price = priceForCourse(code, durationDays);
  return Math.round((price * 0.13) / 10) * 10;
}

export const categories: CourseCategory[] = [
  { slug: "cisco-ccna-enterprise", name: "CCNA Enterprise", vendor: "Cisco", group: "Networking" },
  { slug: "cisco-ccnp-enterprise", name: "CCNP Enterprise", vendor: "Cisco", group: "Networking" },
  { slug: "cisco-ccnp-data-center", name: "CCNP Data Center", vendor: "Cisco", group: "Data Center" },
  { slug: "cisco-ccnp-security", name: "CCNP Security", vendor: "Cisco", group: "Security" },
  { slug: "cisco-ccnp-devnet", name: "CCNP DevNet", vendor: "Cisco", group: "DevOps" },
  { slug: "fortinet", name: "Fortinet", vendor: "Fortinet", group: "Security" },
  { slug: "project-management", name: "Project Management & Agile", vendor: "PMI", group: "Business" },
  { slug: "agile", name: "Agile", vendor: "PMI", group: "Business" },
  { slug: "itil", name: "ITIL & IT Governance", vendor: "PeopleCert", group: "Business" },
  { slug: "cybersecurity-ec-council", name: "EC-Council Cybersecurity", vendor: "EC-Council", group: "Security" },
  { slug: "linux", name: "Linux (LPIC)", vendor: "Linux", group: "Systems" },
  { slug: "pecb-iso27001", name: "ISO/IEC 27001 (PECB)", vendor: "PECB", group: "Security" },
  { slug: "microsoft-windows-server", name: "Windows Server", vendor: "Microsoft", group: "Systems" },
  { slug: "microsoft-azure", name: "Microsoft Azure", vendor: "Microsoft", group: "Cloud" },
  { slug: "microsoft-365", name: "Microsoft 365", vendor: "Microsoft", group: "Productivity" },
  { slug: "microsoft-power-platform", name: "Power Platform", vendor: "Microsoft", group: "Data & AI" },
  { slug: "microsoft-azure-data", name: "Azure Data Platform", vendor: "Microsoft", group: "Data & AI" },
  { slug: "palo-alto", name: "Palo Alto Networks", vendor: "PaloAlto", group: "Security" },
  { slug: "ibm-power", name: "IBM Power System & AIX", vendor: "IBM", group: "Systems" },
  { slug: "togaf", name: "TOGAF", vendor: "Togaf", group: "Architecture" },
];

/** Helper: build a June 2026 session ISO range from "DD au DD". */
const june = (startDay: number, endDay: number) => ({
  start: `2026-06-${String(startDay).padStart(2, "0")}`,
  end: `2026-06-${String(endDay).padStart(2, "0")}`,
});

export const courses: CourseSeed[] = [
  // Cisco
  { code: "CCNA", title: "CCNA Enterprise", durationDays: 5, categorySlug: "cisco-ccna-enterprise", juneSession: june(15, 19) },
  { code: "ENARSI", title: "ENARSI", durationDays: 5, categorySlug: "cisco-ccnp-enterprise", juneSession: june(1, 5) },
  { code: "DCCOR", title: "Implementing and Operating Cisco Data Center Core Technologies", durationDays: 5, categorySlug: "cisco-ccnp-data-center", juneSession: june(1, 5) },
  { code: "DCIT", title: "Troubleshooting Cisco Data Center Infrastructure (DCIT 300-615)", durationDays: 5, categorySlug: "cisco-ccnp-data-center", juneSession: june(8, 12) },
  { code: "SSNGFW", title: "Securing Networks with Cisco Firepower Next Generation Firewall", durationDays: 5, categorySlug: "cisco-ccnp-security", juneSession: june(22, 26) },
  { code: "SISE", title: "Implementing and Configuring Cisco Identity Services Engine v3.0", durationDays: 5, categorySlug: "cisco-ccnp-security", juneSession: june(8, 12) },
  { code: "SESA", title: "Securing Email with Cisco Email Security Appliance", durationDays: 4, categorySlug: "cisco-ccnp-security", juneSession: june(23, 26) },
  { code: "DEVOPS", title: "Implementing DevOps Solutions and Practices using Cisco Platforms", durationDays: 5, categorySlug: "cisco-ccnp-devnet", juneSession: june(15, 19) },

  // Fortinet
  { code: "NSE4", title: "FortiGate Administrator", durationDays: 4, categorySlug: "fortinet", juneSession: june(8, 11) },

  // Project / Agile / ITIL
  { code: "PMP", title: "PMP — Préparation à la certification PMP® du PMI", durationDays: 5, categorySlug: "project-management", juneSession: june(15, 19) },
  { code: "SCRUM", title: "Scrum Master & Product Owner", durationDays: 3, categorySlug: "agile", juneSession: june(10, 12) },
  { code: "ITILF", title: "ITIL 4 Foundation for Service Management", durationDays: 3, categorySlug: "itil", juneSession: june(10, 12) },

  // EC-Council
  { code: "CSA", title: "Certified SOC Analyst", durationDays: 3, categorySlug: "cybersecurity-ec-council", juneSession: june(15, 17) },

  // Linux
  { code: "ATLP1", title: "Préparation à la certification LPIC-1 (102)", durationDays: 5, categorySlug: "linux", juneSession: june(1, 5) },

  // PECB
  { code: "ISO27001LI", title: "ISO/IEC 27001 — Lead Auditor", durationDays: 4, categorySlug: "pecb-iso27001", juneSession: june(8, 11) },

  // Microsoft Windows Server
  { code: "WS-011", title: "Windows Server 2019 Administration", durationDays: 5, categorySlug: "microsoft-windows-server", juneSession: june(1, 5) },

  // Microsoft Azure
  { code: "AZ-104", title: "Microsoft Azure Administrator", durationDays: 5, categorySlug: "microsoft-azure", juneSession: june(1, 5) },
  { code: "AZ-500", title: "Microsoft Azure Security Technologies", durationDays: 5, categorySlug: "microsoft-azure", juneSession: june(1, 5) },
  { code: "AZ-204", title: "Developing Solutions for Microsoft Azure", durationDays: 5, categorySlug: "microsoft-azure", juneSession: june(1, 5) },
  { code: "SC-400", title: "Microsoft Certified Information Protection Administrator Associate", durationDays: 3, categorySlug: "microsoft-azure", juneSession: june(8, 10) },

  // Microsoft 365
  { code: "M-552383", title: "SharePoint Online for Administrators", durationDays: 3, categorySlug: "microsoft-365", juneSession: june(8, 10) },

  // Microsoft Power Platform
  { code: "PL-300", title: "Analysing Data with Microsoft Power BI", durationDays: 4, categorySlug: "microsoft-power-platform", juneSession: june(23, 26) },
  { code: "PL-500", title: "Microsoft Power Automate RPA Developer", durationDays: 5, categorySlug: "microsoft-power-platform", juneSession: june(1, 5) },

  // Microsoft Azure Data Platform
  { code: "DP-100", title: "Designing and Implementing a Data Science Solution on Azure", durationDays: 3, categorySlug: "microsoft-azure-data", juneSession: june(8, 10) },
  { code: "DP-500", title: "Designing and Implementing Enterprise-Scale Analytics Solutions with Azure and Power BI", durationDays: 5, categorySlug: "microsoft-azure-data", juneSession: june(1, 5) },

  // Palo Alto
  { code: "EDU-330", title: "Firewall: Troubleshooting", durationDays: 3, categorySlug: "palo-alto", juneSession: june(10, 12) },

  // IBM
  { code: "AN22G", title: "AIX Network Installation Manager", durationDays: 2, categorySlug: "ibm-power", juneSession: june(4, 5) },
  { code: "AN62G", title: "Advanced PowerHA SystemMirror Configurations", durationDays: 5, categorySlug: "ibm-power", juneSession: june(22, 26) },

  // Togaf
  { code: "TOGAF-F", title: "TOGAF Foundation", durationDays: 3, categorySlug: "togaf", juneSession: june(8, 10) },
  { code: "TOGAF-P", title: "TOGAF Practitioner", durationDays: 2, categorySlug: "togaf", juneSession: june(11, 12) },
];

export const offices = [
  { country: "Tunisia", city: "Tunis", isHeadOffice: true, email: "service-clients@advancia-training.com", phone: "+216 70 014 078" },
  { country: "Morocco", city: "Casablanca", isHeadOffice: false, email: "info.maroc@advancia-training.com", phone: "+212 0522 78 98 26" },
  { country: "France", city: "Aix-en-Provence", isHeadOffice: false, email: "info.france@advancia-training.com", phone: "+33 4-24191444" },
  { country: "Côte d'Ivoire", city: "Abidjan", isHeadOffice: false, email: "info.ci@advancia-training.com", phone: "+225 20 30 92 41" },
] as const;
