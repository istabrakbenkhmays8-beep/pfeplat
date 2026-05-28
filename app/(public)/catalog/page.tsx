import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SearchBar } from "@/components/ui/SearchBar";
import { CourseCard } from "@/components/cards/CourseCard";
import {
  searchCourses,
  listVendors,
  listGroups,
} from "@/src/data/queries";
import type { Vendor } from "@/src/data/seed";

export const metadata = { title: "Courses" };

type SearchParams = Promise<{
  q?: string;
  vendor?: string;
  group?: string;
}>;

const isVendor = (v: string | undefined, list: Vendor[]): v is Vendor =>
  !!v && (list as string[]).includes(v);

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const vendors = listVendors();
  const groups = listGroups();
  const vendor: Vendor | "all" = isVendor(sp.vendor, vendors) ? sp.vendor : "all";
  const group: string | "all" = sp.group && groups.includes(sp.group) ? sp.group : "all";

  const results = searchCourses({ q, vendor, group });
  const activeFilters = [
    q && { label: `"${q}"`, href: pathWithout("q", { q, vendor, group }) },
    vendor !== "all" && { label: `Partner: ${vendor}`, href: pathWithout("vendor", { q, vendor, group }) },
    group !== "all" && { label: `Domain: ${group}`, href: pathWithout("group", { q, vendor, group }) },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <Container size="wide" className="py-10">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Course catalog</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our certification tracks across {vendors.length} authorized partners and {groups.length} domains.
        </p>
      </header>

      <div className="mt-6 max-w-3xl">
        <SearchBar defaultValue={q} size="md" placeholder="Search courses, vendors, certifications…" />
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {activeFilters.map((f) => (
            <Link
              key={f.label}
              href={f.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-fg hover:bg-border"
            >
              {f.label}
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Link>
          ))}
          <Link href="/catalog" className="ms-2 text-xs font-medium text-brand hover:underline">
            Clear all
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <FilterGroup
            title="Partner"
            items={[{ value: "all", label: "All partners" }, ...vendors.map((v) => ({ value: v, label: v }))]}
            paramKey="vendor"
            current={vendor}
            existing={{ q, vendor, group }}
          />
          <FilterGroup
            title="Domain"
            items={[{ value: "all", label: "All domains" }, ...groups.map((g) => ({ value: g, label: g }))]}
            paramKey="group"
            current={group}
            existing={{ q, vendor, group }}
          />
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? "course" : "courses"} found
            </p>
          </div>
          {results.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-lg font-semibold">No courses match these filters</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search term or clear the filters.</p>
              <Link href="/catalog" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
                Clear filters →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((c) => (
                <CourseCard key={c.code} course={c} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Container>
  );
}

function pathWithout(
  remove: "q" | "vendor" | "group",
  state: { q: string; vendor: string; group: string },
) {
  const params = new URLSearchParams();
  if (state.q && remove !== "q") params.set("q", state.q);
  if (state.vendor && state.vendor !== "all" && remove !== "vendor") params.set("vendor", state.vendor);
  if (state.group && state.group !== "all" && remove !== "group") params.set("group", state.group);
  const qs = params.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

function buildHref(
  paramKey: "vendor" | "group",
  value: string,
  state: { q: string; vendor: string; group: string },
) {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (paramKey === "vendor") {
    if (value !== "all") params.set("vendor", value);
    if (state.group !== "all") params.set("group", state.group);
  } else {
    if (state.vendor !== "all") params.set("vendor", state.vendor);
    if (value !== "all") params.set("group", value);
  }
  const qs = params.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

function FilterGroup({
  title,
  items,
  paramKey,
  current,
  existing,
}: {
  title: string;
  items: Array<{ value: string; label: string }>;
  paramKey: "vendor" | "group";
  current: string;
  existing: { q: string; vendor: string; group: string };
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="space-y-1">
        {items.map((it) => {
          const active = current === it.value;
          const href = buildHref(paramKey, it.value, existing);
          return (
            <li key={it.value}>
              <Link
                href={href}
                className={
                  active
                    ? "flex items-center justify-between rounded-md bg-brand px-3 py-2 text-sm font-medium text-brand-foreground"
                    : "flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-fg"
                }
              >
                <span>{it.label}</span>
                {active && (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
