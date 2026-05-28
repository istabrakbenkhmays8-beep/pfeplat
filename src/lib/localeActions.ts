"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/src/i18n";

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return { ok: false as const, error: "InvalidLocale" as const };
  const c = await cookies();
  c.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
