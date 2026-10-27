"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Bottom sheet on phones, centered dialog on larger screens.
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    // iOS shrinks only the visual viewport when the keyboard opens and pushes
    // the page up. Pinning the sheet to the visual viewport keeps it sitting
    // right above the keyboard, with the form scrolling inside it.
    const vv = window.visualViewport;
    const root = rootRef.current;
    const fit = () => {
      if (!vv || !root || vv.height <= 0) return;
      root.style.top = `${vv.offsetTop}px`;
      root.style.height = `${vv.height}px`;
    };
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (el.matches("input, textarea, select")) setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
    };
    fit();
    vv?.addEventListener("resize", fit);
    vv?.addEventListener("scroll", fit);
    root?.addEventListener("focusin", onFocus);

    return () => {
      window.removeEventListener("keydown", onKey);
      vv?.removeEventListener("resize", fit);
      vv?.removeEventListener("scroll", fit);
      root?.removeEventListener("focusin", onFocus);
      window.scrollTo(0, 0);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Portalled to <body> so no parent stacking context can put the tab bar above it.
  return createPortal(
    <div
      ref={rootRef}
      className="fixed inset-x-0 top-0 z-50 flex h-dvh items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 animate-[fade-in_.2s_ease-out] bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="pb-safe relative flex max-h-[92%] w-full animate-[sheet-in_.28s_cubic-bezier(.2,.8,.2,1)] flex-col rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:animate-[toast-in_.2s_ease-out] sm:rounded-3xl dark:bg-zinc-900">
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-zinc-200 sm:hidden dark:bg-zinc-700" />
        <div className="flex shrink-0 items-center justify-between px-5 pt-3 pb-2 sm:pt-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800" aria-label="إغلاق">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pt-2 pb-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
