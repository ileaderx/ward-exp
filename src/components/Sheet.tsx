"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Bottom sheet on phones, centered dialog on larger screens.
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Portalled to <body> so no parent stacking context can put the tab bar above it.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-[fade-in_.2s_ease-out] bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="pb-safe relative flex max-h-[92dvh] w-full animate-[sheet-in_.28s_cubic-bezier(.2,.8,.2,1)] flex-col rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:animate-[toast-in_.2s_ease-out] sm:rounded-3xl dark:bg-zinc-900">
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-zinc-200 sm:hidden dark:bg-zinc-700" />
        <div className="flex items-center justify-between px-5 pt-3 pb-2 sm:pt-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pt-2 pb-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
