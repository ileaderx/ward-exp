"use client";

import { useTransition } from "react";
import { useToast } from "@/components/Toast";
import type { ActionResult } from "@/lib/types";

// Runs a server action, shows a toast with the outcome and calls onDone on success.
export function useSubmit() {
  const [pending, start] = useTransition();
  const toast = useToast();

  function run(action: () => Promise<ActionResult>, onDone?: () => void) {
    start(async () => {
      try {
        const res = await action();
        if (res.ok) {
          if (res.message) toast(res.message);
          onDone?.();
        } else {
          toast(res.error, "error");
        }
      } catch {
        toast("Connection problem. Please try again.", "error");
      }
    });
  }

  return { pending, run };
}
