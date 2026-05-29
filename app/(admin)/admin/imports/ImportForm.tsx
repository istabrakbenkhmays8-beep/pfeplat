"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Upload } from "lucide-react";

type Preview = {
  total: number;
  validCount: number;
  invalidCount: number;
  sample: Array<Record<string, unknown>>;
  errors: Array<{ rowIndex: number; errors: string[] }>;
};

type CommitResult = {
  inserted: number;
  updated: number;
  invalidCount: number;
  defaultPassword: string;
};

export function ImportForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(dryRun: boolean) {
    if (!file) return;
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`/api/admin/imports/users?dryRun=${dryRun ? 1 : 0}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Could not process the file");
        return;
      }
      if (dryRun) {
        setPreview(data);
        toast.success(`${data.validCount} valid, ${data.invalidCount} need fixing`);
      } else {
        const r = data as CommitResult;
        toast.success(`${r.inserted} added, ${r.updated} updated`);
        setPreview(null);
        setFile(null);
        router.push("/admin/users");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">{file ? file.name : "Pick a .xlsx file"}</p>
        <p className="text-xs text-muted-foreground">Max 2 MB</p>
        <label className="mt-4 inline-flex h-10 cursor-pointer items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600">
          <input
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setPreview(null);
            }}
          />
          Choose file
        </label>
      </div>

      {file && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => send(true)}
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Dry run (preview)
          </button>
          <button
            type="button"
            onClick={() => send(false)}
            disabled={busy || (preview ? preview.validCount === 0 : false)}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-success px-4 text-sm font-semibold text-white hover:bg-success/90 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Commit import
          </button>
        </div>
      )}

      {preview && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Preview</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {preview.total} rows · {preview.validCount} valid · {preview.invalidCount} need fixing
          </p>

          {preview.sample.length > 0 && (
            <div className="mt-3 overflow-x-auto rounded-md border border-border">
              <table className="min-w-full text-xs">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    {Object.keys(preview.sample[0]).map((k) => (
                      <th key={k} className="px-2 py-1.5 text-start">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sample.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-2 py-1.5">{String(v ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {preview.errors.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-danger">Errors (showing up to 50):</p>
              <ul className="mt-1 max-h-48 overflow-y-auto text-xs text-muted-foreground">
                {preview.errors.map((e, i) => (
                  <li key={i} className="border-t border-border py-1.5">
                    Row {e.rowIndex}: {e.errors.join(" · ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
