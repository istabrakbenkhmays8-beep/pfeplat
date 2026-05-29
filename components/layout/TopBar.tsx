import Link from "next/link";
import { Container } from "./Container";
import { UserCircle2 } from "lucide-react";
import { getT } from "@/src/i18n/server";
import { CountryFlags } from "./CountryFlags";

export async function TopBar() {
  const { t } = await getT();
  return (
    <div className="bg-brand text-brand-foreground">
      <Container size="wide">
        <div className="flex h-9 items-center justify-between gap-4 text-xs sm:text-sm">
          <CountryFlags />
          <div className="hidden items-center gap-4 sm:flex">
            <button
              type="button"
              className="inline-flex items-center gap-1 font-medium hover:opacity-90"
              aria-haspopup="menu"
            >
              {t.topbar.myAccount}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 font-semibold hover:opacity-90"
            >
              <UserCircle2 className="h-5 w-5" />
              {t.topbar.loginOrRegister}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
