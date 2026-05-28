import { Container } from "@/components/layout/Container";

export const metadata = { title: "Courses" };

export default function CatalogPage() {
  return (
    <Container size="wide" className="py-10">
      <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
      <p className="mt-2 text-muted-foreground">Filter, search, and find your next course.</p>
      <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">The course catalog will appear here soon.</p>
      </div>
    </Container>
  );
}
