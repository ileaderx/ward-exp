"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-ghost px-3 py-2.5" aria-label="Print or save as PDF">
      <Printer className="size-4" />
      <span className="hidden sm:inline">Print</span>
    </button>
  );
}
