"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// The scrolling content area of the app shell. Starts each page at the top.
export function Scroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // iOS can leave the whole page shifted up after the keyboard closes.
  useEffect(() => {
    const onBlur = () =>
      setTimeout(() => {
        const el = document.activeElement;
        if (!el?.matches("input, textarea, select") && window.scrollY !== 0) window.scrollTo(0, 0);
      }, 100);
    document.addEventListener("focusout", onBlur);
    return () => document.removeEventListener("focusout", onBlur);
  }, []);
  return (
    <div ref={ref} className="app-scroll h-full overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
      {children}
    </div>
  );
}
