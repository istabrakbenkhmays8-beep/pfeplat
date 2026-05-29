"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

type Option = { id: string; label: string };

export function TrainerAssignCell({
  sessionId,
  currentTrainerId,
  currentTrainerName,
  options,
}: {
  sessionId: string;
  currentTrainerId: string | null;
  currentTrainerName: string | null;
  options: Option[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentTrainerId ?? "");
  const [pending, startTransition] = useTransition();

  function apply(next: string) {
    setValue(next);
    startTransition(async () => {
      const res = await fetch(`/api/super-admin/sessions/${sessionId}/assign-trainer`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ trainerId: next || null }),
      });
      if (!res.ok) {
        toast.error("Could not assign");
        setValue(currentTrainerId ?? "");
        return;
      }
      toast.success(next ? "Trainer assigned — email sent (or logged in dev)" : "Trainer removed");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => apply(e.target.value)}
        disabled={pending}
        className="h-8 max-w-xs rounded-md border border-border bg-surface px-2 text-xs font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
      >
        <option value="">— Unassigned —</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      {currentTrainerName && !value && (
        <span className="text-[10px] text-muted-foreground">was: {currentTrainerName}</span>
      )}
    </div>
  );
}
