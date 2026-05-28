import { cn } from "@/lib/cn";

/**
 * Inline SVG Advancia logo — crisp at any size, no rasterization.
 * Wordmark uses `currentColor` so it follows the surrounding text color
 * (light/dark theme via `auto`, forced white via `white`).
 *
 * viewBox 260×64. Aspect 4.0625 → width = round(height * 4.0625).
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
  const width = Math.round((260 / 64) * height);

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
        viewBox="0 0 260 64"
        role="img"
        aria-label={ariaLabel}
        width={width}
        height={height}
        className="block"
      >
        <title>{ariaLabel}</title>

        {/* Red play-button mark */}
        <g transform="translate(4 4)">
          <circle cx="28" cy="28" r="28" fill="#C70019" />
          <polygon points="23,16 23,40 41,28" fill="#FFFFFF" />
        </g>

        {/* ADVANCIA wordmark */}
        <g transform="translate(72 0)" fill="currentColor">
          <text
            x="0"
            y="38"
            fontFamily="Inter, Helvetica, Arial, sans-serif"
            fontWeight="900"
            fontSize="32"
            letterSpacing="-0.5"
          >
            ADVANCIA
          </text>
          {/* Registered mark — sits just above the baseline at the right edge of the wordmark */}
          <circle cx="166" cy="16" r="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <text
            x="166"
            y="19"
            textAnchor="middle"
            fontFamily="Inter, Helvetica, Arial, sans-serif"
            fontSize="6"
            fontWeight="700"
          >
            R
          </text>
          {/* TRAINING subtitle */}
          <text
            x="2"
            y="56"
            fontFamily="Inter, Helvetica, Arial, sans-serif"
            fontWeight="600"
            fontSize="9"
            letterSpacing="6"
          >
            TRAINING
          </text>
        </g>
      </svg>
    </span>
  );
}
