"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Loader2, X } from "lucide-react";

export function ReservationActions({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [note, setNote] = useState("");

  function decide(decision: "approved" | "rejected", body: { note?: string } = {}) {
    startTransition(async () => {
      const res = await fetch(`/api/super-admin/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision, ...body }),
      });
      if (!res.ok) {
        toast.error("Could not save the decision");
        return;
      }
      toast.success(decision === "approved" ? "Approved" : "Rejected");
      router.refresh();
    });
  }

  if (showRejectForm) {
    return (
      <div className="flex items-center gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason (optional)"
          className="h-8 w-44 rounded-md border border-border bg-surface px-2 text-xs"
        />
        <button
          type="button"
          onClick={() => decide("rejected", { note })}
          disabled={pending}
          className="inline-flex h-8 items-center gap-1 rounded-md bg-danger px-2 text-xs font-medium text-white disabled:opacity-60"
        >
          {pending && <Loader2 className="h-3 w-3 animate-spin" />}
          Confirm reject
        </button>
        <button
          type="button"
          onClick={() => setShowRejectForm(false)}
          className="text-xs text-muted-foreground hover:text-fg"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => decide("approved")}
        disabled={pending}
        className="inline-flex h-8 items-center gap-1 rounded-md bg-success px-3 text-xs font-medium text-white hover:bg-success/90 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        Approve
      </button>
      <button
        type="button"
        onClick={() => setShowRejectForm(true)}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium text-fg hover:bg-muted"
      >
        <X className="h-3 w-3" />
        Reject
      </button>
    </div>
  );
}
