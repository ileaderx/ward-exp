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
  return (
    <div ref={ref} className="app-scroll h-full overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
      {children}
    </div>
  );
}
