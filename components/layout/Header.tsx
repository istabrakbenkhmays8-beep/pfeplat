import Link from "next/link";
import { cookies } from "next/headers";
import { Container } from "./Container";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { MobileNavToggle } from "./MobileNavToggle";
import { SearchBar } from "@/components/ui/SearchBar";
import { UserMenu } from "./UserMenu";
import { Logo } from "@/components/ui/Logo";
import { getT } from "@/src/i18n/server";

type Nav = { href: string; label: string };

export async function Header({
  variant = "public",
  nav = [],
}: {
  variant?: "public" | "app";
  nav?: Nav[];
}) {
  const c = await cookies();
  const locale = c.get("locale")?.value ?? "en";
  const { t } = await getT();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <Container size="wide">
        <div className="flex h-16 items-center gap-4">
          {variant === "app" && <MobileNavToggle />}
          <Link href="/" aria-label="Advancia Training — home" className="flex items-center">
            <Logo height={40} className="text-fg" />
          </Link>

          {variant === "public" && nav.length > 0 && (
            <nav className="hidden lg:flex items-center gap-1 ms-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-fg"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {variant === "public" && (
            <div className="hidden md:block ms-auto w-full max-w-sm">
              <SearchBar size="sm" placeholder={t.common.searchPlaceholder} />
            </div>
          )}

          <div className={variant === "public" ? "flex items-center gap-2" : "ms-auto flex items-center gap-2"}>
            <LanguageSwitcher current={locale} />
            <ThemeToggle />
            <UserMenu
              variant={variant}
              labels={{
                signIn: t.common.signIn,
                getStarted: t.common.getStarted,
                dashboard: t.common.dashboard,
                coins: t.common.coins,
                profile: t.common.profile,
                signOut: t.common.signOut,
              }}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
