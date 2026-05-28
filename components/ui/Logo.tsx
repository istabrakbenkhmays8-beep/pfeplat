import { cn } from "@/lib/cn";

/**
 * Inline SVG Advancia logo. Uses currentColor for the wordmark, so it follows the
 * theme automatically — no dark-mode pill needed.
 *
 * The circle + play notch stay brand-red regardless of theme.
 */
export function Logo({
  className,
  height = 36,
  ariaLabel = "Advancia Training",
}: {
  className?: string;
  height?: number;
  ariaLabel?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 88"
      role="img"
      aria-label={ariaLabel}
      style={{ height, width: "auto" }}
      className={cn("text-fg", className)}
    >
      <title>{ariaLabel}</title>

      {/* Red circle mark */}
      <g transform="translate(8 8)">
        <circle cx="36" cy="36" r="34" fill="none" stroke="#C70019" strokeWidth="4" />
        <path
          d="M36 8a28 28 0 1 1 0 56a28 28 0 1 1 0 -56M28 22L52 36L28 50Z"
          fill="#C70019"
          fillRule="evenodd"
        />
      </g>

      {/* ADVANCIA wordmark */}
      <g transform="translate(96 0)">
        <text
          x="0"
          y="50"
          fontFamily="Inter, Helvetica, Arial, sans-serif"
          fontWeight="900"
          fontSize="44"
          letterSpacing="-1"
          fill="currentColor"
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
          fill="currentColor"
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
          fill="currentColor"
        >
          TRAINING
        </text>
      </g>
    </svg>
  );
}
