"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export function CompleteCourseButton({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onComplete() {
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Could not mark complete");
        return;
      }
      if (data.coinsAwarded > 0) {
        toast.success(`Completed! +${data.coinsAwarded} coins`);
      } else if (data.alreadyCompleted) {
        toast("Already completed");
      } else {
        toast.success("Course marked as complete");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onComplete}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-medium text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
      title="Mark this course as complete and earn coins"
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      Mark complete
    </button>
  );
}
