import { ImportForm } from "./ImportForm";

export const metadata = { title: "Imports" };

export default function ImportsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Bulk import users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload an Excel file (.xlsx) to create or update users in bulk.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold">Expected columns</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The first sheet is parsed. Column names are case-insensitive — both
          <code className="mx-1 rounded bg-muted px-1">firstName</code>
          and <code className="rounded bg-muted px-1">First Name</code> work.
        </p>
        <ul className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
          <li><strong className="text-fg">firstName</strong> — required</li>
          <li><strong className="text-fg">surname</strong> — required</li>
          <li><strong className="text-fg">email</strong> — required, unique</li>
          <li>gender — male / female / prefer_not_to_say</li>
          <li>age — number</li>
          <li>country — free text</li>
          <li>level — beginner / intermediate / advanced / expert</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          New users get a temporary password <code className="rounded bg-muted px-1">ChangeMe!2026</code>.
        </p>
      </div>

      <ImportForm />
    </div>
  );
}
