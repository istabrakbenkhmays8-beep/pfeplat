import { cookies } from "next/headers";

export type Theme = "light" | "dark" | "system";

/**
 * Read the theme preference from cookies on the server.
 * `system` means: respect the OS preference (the client bootstrap script handles it).
 */
export async function readThemeCookie(): Promise<Theme> {
  const c = await cookies();
  const v = c.get("theme")?.value;
  return v === "light" || v === "dark" ? v : "system";
}

export async function readLocaleCookie(): Promise<string> {
  const c = await cookies();
  return c.get("locale")?.value ?? "en";
}
