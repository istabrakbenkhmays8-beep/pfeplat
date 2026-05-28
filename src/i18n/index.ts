import en from "./dictionaries/en";
import fr from "./dictionaries/fr";
import ar from "./dictionaries/ar";

export const locales = ["en", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "fr" || value === "ar";
}

export function getDictionary(locale: Locale) {
  if (locale === "fr") return fr;
  if (locale === "ar") return ar;
  return en;
}

export function getDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
