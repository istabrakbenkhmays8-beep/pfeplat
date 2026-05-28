import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The real Advancia logo (PNG provided by the user, copied to /public/brand/).
 * Rendered via Next/Image so it stays sharp on retina displays.
 *
 * In dark mode the logo sits on a small white pill so the dark wordmark stays readable.
 */
export function Logo({
  className,
  height = 40,
  variant = "auto",
  ariaLabel = "Advancia Training",
}: {
  className?: string;
  height?: number;
  /** "auto" = adds a white pill in dark mode. "light" = always on light bg (no pill). "white" = white-text alternative for dark backgrounds. */
  variant?: "auto" | "light" | "white";
  ariaLabel?: string;
}) {
  // Approximate aspect from the original 175×64 source.
  const width = Math.round((175 / 64) * height);

  if (variant === "white") {
    // Force a light backdrop pill so the dark wordmark in the PNG is legible on any background.
    return (
      <span className={cn("inline-flex items-center rounded-md bg-white px-2 py-1", className)}>
        <Image
          src="/brand/advancia-logo.png"
          alt={ariaLabel}
          width={width}
          height={height}
          priority
          className="block h-auto w-auto"
          style={{ height, width: "auto" }}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md",
        variant === "auto" && "dark:bg-white dark:px-1.5 dark:py-0.5",
        className,
      )}
    >
      <Image
        src="/brand/advancia-logo.png"
        alt={ariaLabel}
        width={width}
        height={height}
        priority
        className="block h-auto w-auto"
        style={{ height, width: "auto" }}
      />
    </span>
  );
}
