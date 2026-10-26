"use client";

import { useCallback, useState } from "react";
import { HandCoins, Wallet } from "lucide-react";
import { Sheet } from "@/components/Sheet";
import { ExpenseForm } from "@/components/ExpenseForm";
import { DebtForm } from "@/components/DebtForm";

export function QuickActions({ today, categories, people }: { today: string; categories: string[]; people: string[] }) {
  const [open, setOpen] = useState<"expense" | "debt" | null>(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setOpen("expense")} className="card flex items-center gap-3 p-4 text-left transition active:scale-[0.98]">
          <span className="flex size-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            <Wallet className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Add expense</span>
            <span className="block text-xs text-zinc-500">Daily spending</span>
          </span>
        </button>
        <button onClick={() => setOpen("debt")} className="card flex items-center gap-3 p-4 text-left transition active:scale-[0.98]">
          <span className="flex size-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
            <HandCoins className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Add debt</span>
            <span className="block text-xs text-zinc-500">Lent or borrowed</span>
          </span>
        </button>
      </div>
      <Sheet open={open !== null} onClose={close} title={open === "debt" ? "New debt" : "New expense"}>
        {open === "expense" && <ExpenseForm today={today} customCategories={categories} onDone={close} />}
        {open === "debt" && <DebtForm today={today} people={people} onDone={close} />}
      </Sheet>
    </>
  );
}
