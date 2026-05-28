"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-[#E30613] px-4 text-sm font-semibold text-white hover:bg-[#B80510]"
    >
      <Printer className="h-4 w-4" />
      Open print dialog
    </button>
  );
}
