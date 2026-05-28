import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  size?: "narrow" | "default" | "wide";
};

export function Container({ className, size = "default", ...rest }: Props) {
  const max = size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-7xl" : "max-w-6xl";
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", max, className)} {...rest} />;
}
