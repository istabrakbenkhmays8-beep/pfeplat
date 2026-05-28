import Link from "next/link";
import { Container } from "./Container";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileNavToggle } from "./MobileNavToggle";

type Nav = { href: string; label: string };

export function Header({
  variant = "public",
  nav = [],
}: {
  variant?: "public" | "app";
  nav?: Nav[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <Container size="wide">
        <div className="flex h-16 items-center gap-4">
          {variant === "app" && <MobileNavToggle />}
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-foreground font-bold">A</span>
            <span className="font-semibold tracking-tight">Advancia</span>
          </Link>

          {variant === "public" && nav.length > 0 && (
            <nav className="hidden md:flex items-center gap-1 ms-6">
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

          <div className="ms-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Change language"
              className="hidden sm:inline-flex h-9 items-center rounded-full border border-border bg-surface px-3 text-sm text-fg transition hover:bg-muted"
            >
              EN
            </button>
            <ThemeToggle />
            {variant === "public" ? (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-fg hover:bg-muted"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex h-9 items-center rounded-md bg-brand px-3 text-sm font-medium text-brand-foreground hover:bg-brand-600"
                >
                  Get started
                </Link>
              </>
            ) : (
              <button
                type="button"
                aria-label="Profile"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-fg"
              >
                <span className="text-sm font-medium">A</span>
              </button>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
