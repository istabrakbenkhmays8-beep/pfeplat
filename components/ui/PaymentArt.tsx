/**
 * Payment-art primitives — pure inline SVGs so they scale crisply at any size
 * and respect the active theme via `currentColor`.
 *
 *   <AdvanciaCard … />         credit-card mock for the checkout preview
 *   <TunisianWallet … />       wallet illustration with coins, Tunisian motif
 *   <AdvanciaCoin … />         standalone coin (used in lists, badges, hero)
 */
import { cn } from "@/lib/cn";

/* ---------------- AdvanciaCard ---------------- */

export function AdvanciaCard({
  last4 = "4242",
  holder = "ADVANCIA LEARNER",
  expiry = "06/29",
  className,
}: {
  last4?: string;
  holder?: string;
  expiry?: string;
  className?: string;
}) {
  const masked = `•••• •••• •••• ${(last4 || "0000").padStart(4, "0").slice(-4)}`;
  return (
    <svg
      viewBox="0 0 340 214"
      role="img"
      aria-label={`Advancia card ending in ${last4}`}
      className={cn("block w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="acGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C70019" />
          <stop offset="55%" stopColor="#8B0011" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <radialGradient id="acGlow" cx="0.8" cy="0.2" r="0.8">
          <stop offset="0%" stopColor="#ff5060" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#C70019" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4d77a" />
          <stop offset="55%" stopColor="#c9a13c" />
          <stop offset="100%" stopColor="#8a6a1f" />
        </linearGradient>
      </defs>

      {/* Card body */}
      <rect x="0" y="0" width="340" height="214" rx="16" fill="url(#acGrad)" />
      <rect x="0" y="0" width="340" height="214" rx="16" fill="url(#acGlow)" />

      {/* Subtle geometric flourish */}
      <g opacity="0.12" stroke="#ffffff" strokeWidth="1" fill="none">
        <path d="M-20 60 Q120 30 360 110" />
        <path d="M-20 100 Q120 70 360 150" />
        <path d="M-20 140 Q120 110 360 190" />
      </g>

      {/* Advancia mark */}
      <g transform="translate(18 18)">
        <circle cx="16" cy="16" r="16" fill="#ffffff" />
        <polygon points="12,8 12,24 26,16" fill="#C70019" />
      </g>
      <g transform="translate(56 14)" fill="#ffffff">
        <text x="0" y="20" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="16" letterSpacing="-0.3">ADVANCIA</text>
        <text x="0" y="34" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="7" letterSpacing="3" opacity="0.8">LEARNING CARD</text>
      </g>

      {/* Contactless wave (top-right) */}
      <g transform="translate(280 22)" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.85">
        <path d="M0 12 a10 10 0 0 1 12 0" />
        <path d="M4 16 a6 6 0 0 1 8 0" />
        <path d="M8 20 a2.5 2.5 0 0 1 4 0" />
      </g>

      {/* Chip */}
      <g transform="translate(28 70)">
        <rect width="44" height="34" rx="6" fill="url(#chipGrad)" />
        <g stroke="#7a5a14" strokeWidth="0.9" fill="none">
          <line x1="0" y1="11" x2="44" y2="11" />
          <line x1="0" y1="23" x2="44" y2="23" />
          <line x1="14" y1="0" x2="14" y2="34" />
          <line x1="30" y1="0" x2="30" y2="34" />
          <rect x="14" y="11" width="16" height="12" fill="#b89030" stroke="none" />
        </g>
      </g>

      {/* Card number */}
      <text
        x="28"
        y="140"
        fontFamily="'JetBrains Mono', Consolas, monospace"
        fontSize="22"
        fontWeight="600"
        letterSpacing="2"
        fill="#ffffff"
      >
        {masked}
      </text>

      {/* Holder + expiry */}
      <g fill="#ffffff" fontFamily="Inter, sans-serif">
        <text x="28" y="170" fontSize="7" letterSpacing="2" opacity="0.7">CARD HOLDER</text>
        <text x="28" y="186" fontSize="12" fontWeight="700" letterSpacing="0.5">{holder.toUpperCase().slice(0, 24)}</text>

        <text x="220" y="170" fontSize="7" letterSpacing="2" opacity="0.7">EXPIRES</text>
        <text x="220" y="186" fontSize="12" fontWeight="700" letterSpacing="1">{expiry}</text>
      </g>
    </svg>
  );
}

/* ---------------- AdvanciaCoin ---------------- */

export function AdvanciaCoin({
  size = 56,
  className,
  ariaLabel = "Advancia coin",
}: {
  size?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const id = `coin-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={ariaLabel}
      className={cn("block", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`${id}-face`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0%" stopColor="#fff3b0" />
          <stop offset="35%" stopColor="#f0c14b" />
          <stop offset="75%" stopColor="#c08a1a" />
          <stop offset="100%" stopColor="#6e4a08" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2a52e" />
          <stop offset="100%" stopColor="#8c5d10" />
        </linearGradient>
      </defs>

      {/* Outer rim */}
      <circle cx="32" cy="32" r="30" fill={`url(#${id}-rim)`} />
      {/* Inner face */}
      <circle cx="32" cy="32" r="26" fill={`url(#${id}-face)`} />
      {/* Edge stippling — short ticks around the rim */}
      <g stroke="#7a4f0d" strokeWidth="0.8">
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * 2 * Math.PI;
          const x1 = 32 + Math.cos(a) * 27.5;
          const y1 = 32 + Math.sin(a) * 27.5;
          const x2 = 32 + Math.cos(a) * 29.5;
          const y2 = 32 + Math.sin(a) * 29.5;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>

      {/* Advancia play mark embossed */}
      <g transform="translate(32 32)">
        <circle r="14" fill="none" stroke="#7a4f0d" strokeWidth="1.2" opacity="0.75" />
        <polygon points="-5,-7 -5,7 8,0" fill="#7a4f0d" opacity="0.85" />
      </g>

      {/* Top curved text "ADVANCIA" */}
      <defs>
        <path id={`${id}-top`} d="M 9 32 A 23 23 0 0 1 55 32" fill="none" />
        <path id={`${id}-bot`} d="M 9 32 A 23 23 0 0 0 55 32" fill="none" />
      </defs>
      <text fontFamily="Inter, sans-serif" fontSize="5.2" fontWeight="900" fill="#5b3a05" letterSpacing="1.4">
        <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">ADVANCIA</textPath>
      </text>
      <text fontFamily="Inter, sans-serif" fontSize="4.8" fontWeight="700" fill="#5b3a05" letterSpacing="2">
        <textPath href={`#${id}-bot`} startOffset="50%" textAnchor="middle">★ 1 COIN ★</textPath>
      </text>

      {/* Glossy highlight */}
      <ellipse cx="22" cy="20" rx="10" ry="4" fill="#ffffff" opacity="0.28" />
    </svg>
  );
}

/* ---------------- TunisianWallet ---------------- */

export function TunisianWallet({
  coins = 0,
  className,
}: {
  /** Number of coins shown on the balance label (does not affect art). */
  coins?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 440 260"
      role="img"
      aria-label="Tunisian wallet with Advancia coins"
      className={cn("block w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff5f6" />
          <stop offset="100%" stopColor="#ffe4e6" />
        </linearGradient>
        <linearGradient id="leather" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a0915" />
          <stop offset="60%" stopColor="#6a0810" />
          <stop offset="100%" stopColor="#3d040a" />
        </linearGradient>
        <linearGradient id="leatherTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a30c1c" />
          <stop offset="100%" stopColor="#7a0816" />
        </linearGradient>
        <linearGradient id="coinFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcdc7a" />
          <stop offset="100%" stopColor="#c08a1a" />
        </linearGradient>
        <linearGradient id="cardPeek" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3f3f5" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Soft pink stage */}
      <rect x="0" y="0" width="440" height="260" rx="14" fill="url(#bg)" />

      {/* Subtle Tunisian crescent + star motifs in the background */}
      <g opacity="0.06" fill="#C70019">
        <g transform="translate(370 40)">
          <circle r="22" />
          <circle r="16" cx="6" cy="-3" fill="#fff5f6" />
        </g>
        <g transform="translate(60 220)">
          <polygon points="0,-14 4,-4 14,-4 6,3 9,13 0,7 -9,13 -6,3 -14,-4 -4,-4" />
        </g>
      </g>

      {/* Drop shadow under wallet */}
      <ellipse cx="220" cy="225" rx="160" ry="12" fill="#000" opacity="0.18" filter="url(#shadow)" />

      {/* Wallet back panel */}
      <rect x="60" y="80" width="320" height="140" rx="14" fill="url(#leather)" />
      {/* Stitching */}
      <rect x="60" y="80" width="320" height="140" rx="14" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeDasharray="3 3" strokeWidth="1" />

      {/* Card peeking out (top, Advancia card design simplified) */}
      <g transform="translate(118 60)">
        <rect width="200" height="80" rx="8" fill="url(#cardPeek)" />
        <rect x="0" y="0" width="200" height="80" rx="8" fill="none" stroke="#d0d0d4" />
        <g transform="translate(12 12)">
          <circle cx="10" cy="10" r="10" fill="#C70019" />
          <polygon points="7,5 7,15 16,10" fill="#fff" />
        </g>
        <text x="32" y="18" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="10" fill="#1a1a1a">ADVANCIA</text>
        <text x="32" y="28" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="5" letterSpacing="2" fill="#666">LEARNING CARD</text>
        <text x="12" y="60" fontFamily="'JetBrains Mono', Consolas, monospace" fontWeight="600" fontSize="9" letterSpacing="1" fill="#222">•••• •••• 4242</text>
        <text x="12" y="72" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="6" fill="#666">EXP 06/29</text>
      </g>

      {/* Wallet front panel (overlapping to give depth) */}
      <path d="M60 140 L60 220 Q60 234 74 234 L366 234 Q380 234 380 220 L380 140 Q380 132 366 130 L74 130 Q60 132 60 140 Z" fill="url(#leatherTop)" />
      {/* Front-panel stitching */}
      <path d="M68 142 Q220 138 372 142" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeDasharray="3 3" />

      {/* Tunisian flag patch on the front-bottom-left */}
      <g transform="translate(78 188)">
        <rect width="44" height="30" rx="3" fill="#E70013" />
        <circle cx="22" cy="15" r="9" fill="#ffffff" />
        <circle cx="25" cy="15" r="7" fill="#E70013" />
        <polygon points="22,11 23.2,13.2 25.6,13.6 23.8,15.3 24.3,17.6 22,16.4 19.7,17.6 20.2,15.3 18.4,13.6 20.8,13.2" fill="#E70013" />
        <rect width="44" height="30" rx="3" fill="none" stroke="#ffffff" strokeOpacity="0.6" />
      </g>

      {/* Coins spilling out, front-right */}
      <g transform="translate(250 175)">
        {/* Stacked + scattered coins */}
        <g transform="translate(70 35)">
          <ellipse cx="0" cy="0" rx="22" ry="6" fill="#7a4f0d" />
          <circle cx="0" cy="-2" r="20" fill="url(#coinFace)" stroke="#7a4f0d" strokeWidth="1" />
          <circle cx="0" cy="-2" r="14" fill="none" stroke="#8a5a0e" strokeWidth="0.8" />
          <polygon points="-4,-7 -4,3 6,-2" fill="#7a4f0d" />
        </g>
        <g transform="translate(35 15)">
          <ellipse cx="0" cy="0" rx="18" ry="5" fill="#7a4f0d" />
          <circle cx="0" cy="-2" r="16" fill="url(#coinFace)" stroke="#7a4f0d" strokeWidth="1" />
          <polygon points="-3,-5 -3,3 5,-1" fill="#7a4f0d" />
        </g>
        <g transform="translate(105 12)">
          <ellipse cx="0" cy="0" rx="16" ry="5" fill="#7a4f0d" />
          <circle cx="0" cy="-2" r="14" fill="url(#coinFace)" stroke="#7a4f0d" strokeWidth="1" />
          <polygon points="-2.5,-4 -2.5,2 4,-1" fill="#7a4f0d" />
        </g>
        <g transform="translate(20 50)">
          <circle r="10" fill="url(#coinFace)" stroke="#7a4f0d" strokeWidth="1" />
        </g>
      </g>

      {/* Balance ribbon top-left */}
      <g transform="translate(20 20)">
        <rect width="140" height="30" rx="14" fill="#1a1a1a" />
        <circle cx="18" cy="15" r="10" fill="url(#coinFace)" stroke="#7a4f0d" strokeWidth="1" />
        <text x="38" y="20" fontFamily="Inter, sans-serif" fontSize="13" fill="#fff">
          <tspan fontWeight="800">{coins.toLocaleString()}</tspan>
          <tspan dx="6" fontWeight="600" fontSize="9" opacity="0.75">coins</tspan>
        </text>
      </g>

      {/* "DT" tag corner */}
      <g transform="translate(395 20)">
        <rect x="-30" width="30" height="22" rx="6" fill="#C70019" />
        <text x="-15" y="15" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="11" fill="#fff" letterSpacing="1">DT</text>
      </g>
    </svg>
  );
}
