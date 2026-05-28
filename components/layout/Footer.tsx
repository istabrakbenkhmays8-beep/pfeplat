import Link from "next/link";
import { Container } from "./Container";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <Container size="wide">
        <div className="grid gap-8 py-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-foreground font-bold">A</span>
              <span className="font-semibold">Advancia Training</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Learn online and on-site. Earn coins. Get certified.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/catalog" className="hover:text-fg">All courses</Link></li>
              <li><Link href="/catalog" className="hover:text-fg">Categories</Link></li>
              <li><Link href="/contact" className="hover:text-fg">Contact us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/login" className="hover:text-fg">Sign in</Link></li>
              <li><Link href="/auth/register" className="hover:text-fg">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Advancia</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Tunis, Tunisia</li>
              <li>contact@advancia.tn</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">© {year} Advancia Training. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Made with care in Tunisia.</p>
        </div>
      </Container>
    </footer>
  );
}
