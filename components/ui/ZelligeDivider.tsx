/**
 * A 32px-tall horizontal strip of Tunisian zellige-inspired geometric tilework.
 * Pure SVG, repeats across the full width. Used as section dividers to add a Tunisian touch.
 *
 * Pattern: 8-pointed stars + interlaced kite squares — a classic motif found across
 * Tunisian and broader Maghreb craft. Drawn in pure geometry, no third-party assets.
 */
export function ZelligeDivider({ className }: { className?: string }) {
  return (
    <div
      className={className}
      aria-hidden
      style={{
        height: 24,
        backgroundColor: "var(--color-brand)",
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "48px 24px",
      }}
    />
  );
}

// 48 × 24 tile — kept tight so the repeat feels like real woven tile.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 24">
  <rect width="48" height="24" fill="#E30613"/>
  <!-- White 8-pointed star -->
  <g fill="#ffffff" opacity="0.95">
    <polygon points="12,6 13.4,10.6 18,12 13.4,13.4 12,18 10.6,13.4 6,12 10.6,10.6"/>
    <polygon points="12,7 13,11 17,12 13,13 12,17 11,13 7,12 11,11"/>
    <polygon points="36,6 37.4,10.6 42,12 37.4,13.4 36,18 34.6,13.4 30,12 34.6,10.6"/>
    <polygon points="36,7 37,11 41,12 37,13 36,17 35,13 31,12 35,11"/>
  </g>
  <!-- Tiny interlace dots -->
  <g fill="#ffffff" opacity="0.45">
    <circle cx="0" cy="12" r="1"/>
    <circle cx="24" cy="12" r="1.2"/>
    <circle cx="48" cy="12" r="1"/>
  </g>
</svg>`;
