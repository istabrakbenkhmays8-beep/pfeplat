"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export function EnrollButton({ courseCode }: { courseCode: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  async function onEnroll() {
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/catalog/${courseCode}`)}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error === "CourseNotFound" ? "Course not found" : "Could not enroll");
        return;
      }
      if (data.alreadyEnrolled) {
        toast.success("You're already enrolled — opening your courses");
      } else {
        toast.success("Enrolled! Welcome aboard.");
      }
      router.push("/my-courses");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const label =
    status === "unauthenticated"
      ? "Sign in to enroll"
      : session?.user?.role === "user"
      ? "Enroll now"
      : "Enroll now";

  return (
    <button
      type="button"
      onClick={onEnroll}
      disabled={loading || status === "loading"}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand-600 disabled:opacity-60"
    >
      {loading && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}
