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
