import { cn } from "@/lib/cn";

/**
 * Inline SVG Advancia logo — crisp at any size, no rasterization.
 * Wordmark uses `currentColor` so it follows the surrounding text color
 * (light/dark theme via `auto`, forced white via `white`).
 */
export function Logo({
  className,
  height = 40,
  variant = "auto",
  ariaLabel = "Advancia Training",
}: {
  className?: string;
  height?: number;
  /** "auto" follows surrounding text color. "white" forces white text (for dark surfaces like the footer). */
  variant?: "auto" | "white";
  ariaLabel?: string;
}) {
  // viewBox is 320×88 — preserve aspect.
  const width = Math.round((320 / 88) * height);

  return (
    <span
      className={cn(
        "inline-flex items-center",
        variant === "white" ? "text-white" : "text-fg",
        className,
      )}
      style={{ height, width }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 88"
        role="img"
        aria-label={ariaLabel}
        width={width}
        height={height}
        className="block"
      >
        <title>{ariaLabel}</title>
        {/* Red brand mark */}
        <g transform="translate(8 8)">
          <circle cx="36" cy="36" r="34" fill="none" stroke="#C70019" strokeWidth="4" />
          <path
            d="M36 8 a28 28 0 1 1 0 56 a28 28 0 1 1 0 -56 M28 22 L52 36 L28 50 Z"
            fill="#C70019"
            fillRule="evenodd"
          />
        </g>

        {/* ADVANCIA wordmark */}
        <g transform="translate(96 0)" fill="currentColor">
          <text
            x="0"
            y="50"
            fontFamily="Inter, Helvetica, Arial, sans-serif"
            fontWeight="900"
            fontSize="44"
            letterSpacing="-1"
          >
            ADVANCIA
          </text>
          <circle cx="222" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text
            x="222"
            y="24"
            textAnchor="middle"
            fontFamily="Inter, Helvetica, Arial, sans-serif"
            fontSize="7"
            fontWeight="700"
          >
            R
          </text>
          <text
            x="0"
            y="76"
            fontFamily="Inter, Helvetica, Arial, sans-serif"
            fontWeight="500"
            fontSize="13"
            letterSpacing="9"
          >
            TRAINING
          </text>
        </g>
      </svg>
    </span>
  );
}
