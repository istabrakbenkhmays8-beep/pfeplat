import { cookies } from "next/headers";
import { getDictionary, isLocale, type Locale } from "./index";

/**
 * Server-side helper: reads the locale cookie and returns the matching dictionary.
 * Use in Server Components / route handlers / server actions.
 */
export async function getT() {
  const c = await cookies();
  const raw = c.get("locale")?.value;
  const locale: Locale = isLocale(raw) ? raw : "en";
  return { t: getDictionary(locale), locale };
}
