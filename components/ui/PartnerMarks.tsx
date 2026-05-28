/**
 * Inline SVG partner marks. Hand-drawn stylized logos that evoke each brand's identity
 * without reproducing trademarked artwork. Used in the partners carousel.
 *
 * Each mark renders to a fixed 160×56 viewport so the carousel tiles align.
 */

import type { ReactNode } from "react";

const W = 160;
const H = 56;

const baseStyle = "block";

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      role="img"
      aria-label={label}
      className={baseStyle}
    >
      {children}
    </svg>
  );
}

export function MicrosoftMark() {
  return (
    <Frame label="Microsoft Gold Partner">
      <g transform="translate(14 14)">
        <rect x="0" y="0" width="12" height="12" fill="#F25022" />
        <rect x="14" y="0" width="12" height="12" fill="#7FBA00" />
        <rect x="0" y="14" width="12" height="12" fill="#00A4EF" />
        <rect x="14" y="14" width="12" height="12" fill="#FFB900" />
      </g>
      <g transform="translate(50 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="24" fontSize="14" fontWeight="700">Microsoft</text>
        <text x="0" y="42" fontSize="9" letterSpacing="2" opacity="0.7">GOLD PARTNER</text>
      </g>
    </Frame>
  );
}

export function CiscoMark() {
  return (
    <Frame label="Cisco Learning Partner">
      <g transform="translate(16 18)" fill="#1BA0D7">
        {[0, 8, 16, 24, 32].map((x, i) => {
          const h = i === 2 ? 20 : i === 1 || i === 3 ? 14 : 8;
          return <rect key={x} x={x} y={(20 - h) / 2 + 2} width="4" height={h} rx="1" />;
        })}
      </g>
      <g transform="translate(58 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="24" fontSize="16" fontWeight="800">CISCO</text>
        <text x="0" y="42" fontSize="9" letterSpacing="2" opacity="0.7">LEARNING PARTNER</text>
      </g>
    </Frame>
  );
}

export function FortinetMark() {
  return (
    <Frame label="Fortinet Authorized">
      <g transform="translate(14 16)">
        <path d="M0 0 L14 0 L14 4 L4 4 L4 10 L12 10 L12 14 L4 14 L4 24 L0 24 Z" fill="#EE3124" />
        <rect x="18" y="0" width="4" height="24" fill="#EE3124" />
      </g>
      <g transform="translate(50 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="24" fontSize="14" fontWeight="800" letterSpacing="2">FORTINET</text>
        <text x="0" y="42" fontSize="9" letterSpacing="2" opacity="0.7">AUTHORIZED</text>
      </g>
    </Frame>
  );
}

export function VMwareMark() {
  return (
    <Frame label="VMware Authorized">
      <g transform="translate(14 18)" fill="#717074">
        <path d="M0 0 H6 L8 14 L13 0 H19 L21 14 L26 0 H32 L24 22 H18 L16 8 L14 22 H8 Z" />
      </g>
      <g transform="translate(50 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="24" fontSize="14" fontWeight="800">VMware</text>
        <text x="0" y="42" fontSize="9" letterSpacing="2" opacity="0.7">PARTNER</text>
      </g>
    </Frame>
  );
}

export function EcCouncilMark() {
  return (
    <Frame label="EC-Council Accredited">
      <g transform="translate(16 14)">
        <circle cx="14" cy="14" r="14" fill="#003B5C" />
        <text x="14" y="19" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="900" fill="#ffffff">EC</text>
      </g>
      <g transform="translate(52 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="24" fontSize="13" fontWeight="700">EC-Council</text>
        <text x="0" y="42" fontSize="9" letterSpacing="2" opacity="0.7">ACCREDITED</text>
      </g>
    </Frame>
  );
}

export function PecbMark() {
  return (
    <Frame label="PECB Authorized">
      <g transform="translate(14 14)">
        <rect x="0" y="0" width="32" height="28" rx="3" fill="#6E2A8F" />
        <text x="16" y="20" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="800" fill="#ffffff">PECB</text>
      </g>
      <g transform="translate(54 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="24" fontSize="13" fontWeight="700">PECB</text>
        <text x="0" y="42" fontSize="9" letterSpacing="2" opacity="0.7">AUTHORIZED</text>
      </g>
    </Frame>
  );
}

export function PmiMark() {
  return (
    <Frame label="PMI Authorized">
      <g transform="translate(16 14)">
        <circle cx="14" cy="14" r="14" fill="#F08820" />
        <text x="14" y="19" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="900" fill="#ffffff">PMI</text>
      </g>
      <g transform="translate(52 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="24" fontSize="14" fontWeight="700">PMI</text>
        <text x="0" y="42" fontSize="9" letterSpacing="2" opacity="0.7">TRAINING PARTNER</text>
      </g>
    </Frame>
  );
}

export function PaloAltoMark() {
  return (
    <Frame label="Palo Alto Networks">
      <g transform="translate(14 14)" fill="#FF6A1F">
        <rect x="0" y="0" width="8" height="28" rx="2" />
        <rect x="11" y="6" width="8" height="22" rx="2" />
        <rect x="22" y="12" width="8" height="16" rx="2" />
      </g>
      <g transform="translate(52 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="22" fontSize="11" fontWeight="800">paloalto</text>
        <text x="0" y="40" fontSize="9" letterSpacing="2" opacity="0.7">NETWORKS</text>
      </g>
    </Frame>
  );
}

export function IbmMark() {
  return (
    <Frame label="IBM Authorized">
      <g transform="translate(14 16)" fill="#1F70C1">
        {[0, 0, 6, 6, 12, 12, 18, 18].map((y, i) => (
          <rect key={i} x={(i % 2) * 2} y={i * 3} width="28" height="2" />
        ))}
      </g>
      <g transform="translate(54 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="24" fontSize="16" fontWeight="900">IBM</text>
        <text x="0" y="42" fontSize="9" letterSpacing="2" opacity="0.7">AUTHORIZED</text>
      </g>
    </Frame>
  );
}

export function PearsonMark() {
  return (
    <Frame label="Pearson VUE">
      <g transform="translate(14 14)">
        <path d="M0 28 L0 0 L18 0 Q26 0 26 8 Q26 16 18 16 L6 16 L6 28 Z" fill="#0072C6" />
      </g>
      <g transform="translate(50 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="24" fontSize="13" fontWeight="700">Pearson</text>
        <text x="0" y="42" fontSize="9" letterSpacing="2" opacity="0.7">VUE TEST CENTER</text>
      </g>
    </Frame>
  );
}

export function PsiMark() {
  return (
    <Frame label="PSI Testing">
      <g transform="translate(16 16)">
        <ellipse cx="16" cy="14" rx="16" ry="12" fill="none" stroke="#7B2682" strokeWidth="3" />
        <text x="16" y="19" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="800" fill="#7B2682">psi</text>
      </g>
      <g transform="translate(56 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="24" fontSize="13" fontWeight="700">PSI</text>
        <text x="0" y="42" fontSize="9" letterSpacing="2" opacity="0.7">TESTING</text>
      </g>
    </Frame>
  );
}

export function CompTiaMark() {
  return (
    <Frame label="CompTIA">
      <g transform="translate(14 14)">
        <rect x="0" y="0" width="32" height="28" rx="14" fill="#C8202F" />
        <text x="16" y="20" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="900" fill="#ffffff">C+</text>
      </g>
      <g transform="translate(54 0)" fontFamily="Inter, sans-serif" fill="currentColor">
        <text x="0" y="24" fontSize="13" fontWeight="700">CompTIA</text>
        <text x="0" y="42" fontSize="9" letterSpacing="2" opacity="0.7">PARTNER</text>
      </g>
    </Frame>
  );
}

export const PARTNER_MARKS = [
  MicrosoftMark,
  CiscoMark,
  FortinetMark,
  VMwareMark,
  EcCouncilMark,
  PecbMark,
  PmiMark,
  PaloAltoMark,
  IbmMark,
  PearsonMark,
  PsiMark,
  CompTiaMark,
];

/* -------------------------------------------------------------------------- */
/*  Compact vendor icons (no text) — used inside the "Browse by partner"      */
/*  tiles, where the vendor name is rendered next to the mark.                */
/*  Each icon renders in a 40×40 box so tiles stay aligned.                   */
/* -------------------------------------------------------------------------- */

const ICON = 40;

function IconFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox={`0 0 ${ICON} ${ICON}`} width={ICON} height={ICON} role="img" aria-label={label} className="block">
      {children}
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <IconFrame label="Microsoft">
      <rect x="4" y="4" width="14" height="14" fill="#F25022" />
      <rect x="22" y="4" width="14" height="14" fill="#7FBA00" />
      <rect x="4" y="22" width="14" height="14" fill="#00A4EF" />
      <rect x="22" y="22" width="14" height="14" fill="#FFB900" />
    </IconFrame>
  );
}

function CiscoIcon() {
  return (
    <IconFrame label="Cisco">
      <g fill="#1BA0D7">
        {[6, 13, 20, 27, 34].map((x, i) => {
          const h = i === 2 ? 28 : i === 1 || i === 3 ? 20 : 12;
          return <rect key={x} x={x - 2} y={(40 - h) / 2} width="4" height={h} rx="1.5" />;
        })}
      </g>
    </IconFrame>
  );
}

function FortinetIcon() {
  return (
    <IconFrame label="Fortinet">
      <rect x="2" y="2" width="36" height="36" rx="6" fill="#EE3124" />
      <path d="M11 10 H30 V15 H17 V20 H27 V25 H17 V31 H11 Z" fill="#ffffff" />
    </IconFrame>
  );
}

function VMwareIcon() {
  return (
    <IconFrame label="VMware">
      <g transform="translate(2 11)" fill="#717074">
        <path d="M0 0 H7 L9.5 14 L14.5 0 H21 L23.5 14 L28.5 0 H36 L26 19 H19 L17 8 L15 19 H8 Z" />
      </g>
    </IconFrame>
  );
}

function EcCouncilIcon() {
  return (
    <IconFrame label="EC-Council">
      <circle cx="20" cy="20" r="18" fill="#003B5C" />
      <text x="20" y="25" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="15" fontWeight="900" fill="#ffffff">EC</text>
    </IconFrame>
  );
}

function PecbIcon() {
  return (
    <IconFrame label="PECB">
      <rect x="2" y="6" width="36" height="28" rx="5" fill="#6E2A8F" />
      <text x="20" y="26" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="800" fill="#ffffff">PECB</text>
    </IconFrame>
  );
}

function PmiIcon() {
  return (
    <IconFrame label="PMI">
      <circle cx="20" cy="20" r="18" fill="#F08820" />
      <text x="20" y="25" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="900" fill="#ffffff">PMI</text>
    </IconFrame>
  );
}

function PaloAltoIcon() {
  return (
    <IconFrame label="Palo Alto Networks">
      <g fill="#FF6A1F">
        <rect x="4" y="6" width="10" height="28" rx="2" />
        <rect x="17" y="14" width="10" height="20" rx="2" />
        <rect x="30" y="22" width="10" height="12" rx="2" />
      </g>
    </IconFrame>
  );
}

function IbmIcon() {
  return (
    <IconFrame label="IBM">
      <g fill="#1F70C1">
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={(i % 2) * 2 + 3} y={6 + i * 3.5} width="34" height="2" />
        ))}
      </g>
    </IconFrame>
  );
}

function PearsonIcon() {
  return (
    <IconFrame label="Pearson VUE">
      <path d="M8 34 L8 6 L24 6 Q33 6 33 16 Q33 26 24 26 L14 26 L14 34 Z" fill="#0072C6" />
    </IconFrame>
  );
}

function PsiIcon() {
  return (
    <IconFrame label="PSI">
      <ellipse cx="20" cy="20" rx="18" ry="14" fill="none" stroke="#7B2682" strokeWidth="3" />
      <text x="20" y="25" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="800" fill="#7B2682">psi</text>
    </IconFrame>
  );
}

function CompTiaIcon() {
  return (
    <IconFrame label="CompTIA">
      <rect x="2" y="8" width="36" height="24" rx="12" fill="#C8202F" />
      <text x="20" y="26" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="900" fill="#ffffff">C+</text>
    </IconFrame>
  );
}

function PeopleCertIcon() {
  return (
    <IconFrame label="PeopleCert">
      <rect x="2" y="2" width="36" height="36" rx="6" fill="#00A0E3" />
      <text x="20" y="25" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="900" fill="#ffffff">Pc</text>
    </IconFrame>
  );
}

function LinuxIcon() {
  // Stylized Tux silhouette — body + belly + feet, kept simple and recognisable.
  return (
    <IconFrame label="Linux">
      <g>
        <ellipse cx="20" cy="20" rx="13" ry="16" fill="#000000" />
        <ellipse cx="20" cy="24" rx="8" ry="11" fill="#FFFFFF" />
        <circle cx="16" cy="14" r="2.4" fill="#FFFFFF" />
        <circle cx="24" cy="14" r="2.4" fill="#FFFFFF" />
        <circle cx="16" cy="14" r="1.1" fill="#000000" />
        <circle cx="24" cy="14" r="1.1" fill="#000000" />
        <path d="M17 18 Q20 21 23 18 L20 21 Z" fill="#F7B500" />
        <path d="M13 34 Q15 30 18 32 Z" fill="#F7B500" />
        <path d="M27 34 Q25 30 22 32 Z" fill="#F7B500" />
      </g>
    </IconFrame>
  );
}

function TogafIcon() {
  return (
    <IconFrame label="TOGAF">
      <rect x="2" y="2" width="36" height="36" rx="6" fill="#0E7C66" />
      <path d="M10 12 H30 V16 H22 V30 H18 V16 H10 Z" fill="#ffffff" />
    </IconFrame>
  );
}

function GenericIcon({ name }: { name: string }) {
  const initials = name
    .replace(/[^a-zA-Z]/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase() || "•";
  // Hash → hue for a stable, distinct tile colour per vendor name.
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return (
    <IconFrame label={name}>
      <rect x="2" y="2" width="36" height="36" rx="6" fill={`hsl(${hue} 55% 40%)`} />
      <text x="20" y="25" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="800" fill="#ffffff">{initials}</text>
    </IconFrame>
  );
}

/** Render the compact logo for a vendor name (matches values from the catalog seed). */
export function VendorIcon({ vendor }: { vendor: string }) {
  const key = vendor.trim().toLowerCase().replace(/[\s_-]+/g, "");
  switch (key) {
    case "microsoft":
      return <MicrosoftIcon />;
    case "cisco":
      return <CiscoIcon />;
    case "fortinet":
      return <FortinetIcon />;
    case "vmware":
      return <VMwareIcon />;
    case "eccouncil":
      return <EcCouncilIcon />;
    case "pecb":
      return <PecbIcon />;
    case "pmi":
      return <PmiIcon />;
    case "paloalto":
    case "paloaltonetworks":
      return <PaloAltoIcon />;
    case "ibm":
      return <IbmIcon />;
    case "pearson":
    case "pearsonvue":
      return <PearsonIcon />;
    case "psi":
      return <PsiIcon />;
    case "comptia":
      return <CompTiaIcon />;
    case "peoplecert":
      return <PeopleCertIcon />;
    case "linux":
    case "lpic":
      return <LinuxIcon />;
    case "togaf":
      return <TogafIcon />;
    default:
      return <GenericIcon name={vendor} />;
  }
}
