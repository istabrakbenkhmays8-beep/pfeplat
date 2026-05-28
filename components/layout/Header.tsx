import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { Container } from "./Container";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { MobileNavToggle } from "./MobileNavToggle";
import { SearchBar } from "@/components/ui/SearchBar";
import { UserMenu } from "./UserMenu";

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

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <Container size="wide">
        <div className="flex h-16 items-center gap-4">
          {variant === "app" && <MobileNavToggle />}
          <Link href="/" aria-label="Advancia Training — home" className="flex items-center">
            <span className="inline-flex items-center rounded-md px-1 py-0.5 dark:bg-white">
              <Image
                src="/brand/advancia-logo.png"
                alt="Advancia Training"
                width={175}
                height={64}
                priority
                className="h-7 w-auto sm:h-8"
              />
            </span>
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
              <SearchBar size="sm" placeholder="Search courses…" />
            </div>
          )}

          <div className={variant === "public" ? "flex items-center gap-2" : "ms-auto flex items-center gap-2"}>
            <LanguageSwitcher current={locale} />
            <ThemeToggle />
            <UserMenu variant={variant} />
          </div>
        </div>
      </Container>
    </header>
  );
}
