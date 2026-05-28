import { cn } from "@/lib/cn";

type Props = {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  action?: string;
  autoFocus?: boolean;
};

export function SearchBar({
  defaultValue,
  placeholder = "Search courses, vendors, certifications…",
  className,
  size = "md",
  action = "/catalog",
  autoFocus,
}: Props) {
  const heights = { sm: "h-9", md: "h-11", lg: "h-14" };
  const textSize = { sm: "text-sm", md: "text-sm", lg: "text-base" };
  return (
    <form
      action={action}
      method="get"
      role="search"
      className={cn("relative flex w-full items-center", className)}
    >
      <span aria-hidden className="pointer-events-none absolute start-3 text-muted-foreground">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label="Search courses"
        autoFocus={autoFocus}
        className={cn(
          "w-full rounded-full border border-border bg-surface ps-10 pe-24 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20",
          heights[size],
          textSize[size],
        )}
      />
      <button
        type="submit"
        className={cn(
          "absolute end-1 inline-flex items-center justify-center rounded-full bg-brand px-4 font-medium text-brand-foreground hover:bg-brand-600",
          size === "sm" ? "h-7 text-xs" : size === "lg" ? "h-12 text-sm" : "h-9 text-sm",
        )}
      >
        Search
      </button>
    </form>
  );
}
