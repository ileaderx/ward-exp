"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";

type Toast = { id: number; text: string; kind: "ok" | "error" };
const ToastContext = createContext<(text: string, kind?: Toast["kind"]) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, kind: Toast["kind"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={clsx(
              "flex animate-[toast-in_.25s_ease-out] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg",
              t.kind === "ok" ? "bg-zinc-900 dark:bg-zinc-800" : "bg-rose-600",
            )}
          >
            {t.kind === "ok" ? <CheckCircle2 className="size-4 text-emerald-400" /> : <XCircle className="size-4" />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
