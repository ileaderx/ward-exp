"use client";

import { useState } from "react";
import clsx from "clsx";
import { Loader2, Trash2 } from "lucide-react";
import { deleteExpense, saveExpense } from "@/lib/actions";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import type { ExpenseItem } from "@/lib/types";
import { AmountInput, Label } from "@/components/Field";
import { useSubmit } from "@/components/useSubmit";

export function ExpenseForm({
  expense,
  today,
  customCategories,
  onDone,
}: {
  expense?: ExpenseItem;
  today: string;
  customCategories: string[];
  onDone: () => void;
}) {
  const { pending, run } = useSubmit();
  const [category, setCategory] = useState(expense?.category ?? "");
  const presetNames = EXPENSE_CATEGORIES.map((c) => c.name as string);
  const extras = customCategories.filter((c) => !presetNames.includes(c));

  return (
    <form
      action={(fd) => {
        if (!category.trim()) {
          run(async () => ({ ok: false, error: "اختر الفئة" }));
          return;
        }
        fd.set("category", category.trim());
        run(() => saveExpense(fd), onDone);
      }}
      className="space-y-5"
    >
      {expense && <input type="hidden" name="id" value={expense.id} />}
      <AmountInput defaultValue={expense?.amount} autoFocus={!expense} />

      <div>
        <Label>الفئة</Label>
        <div className="grid grid-cols-4 gap-2">
          {EXPENSE_CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.name}
              onClick={() => setCategory(c.name)}
              className={clsx(
                "flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[11px] font-medium ring-1 transition",
                category === c.name
                  ? "bg-brand-50 text-brand-700 ring-2 ring-brand-500 dark:bg-brand-500/15 dark:text-brand-100"
                  : "bg-zinc-50 text-zinc-600 ring-black/5 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/5",
              )}
            >
              <span className="text-xl leading-none">{c.emoji}</span>
              <span className="w-full truncate text-center">{c.name}</span>
            </button>
          ))}
        </div>
        {extras.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {extras.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCategory(c)}
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-medium ring-1",
                  category === c ? "bg-brand-600 text-white ring-brand-600" : "bg-zinc-50 text-zinc-600 ring-black/5 dark:bg-zinc-800 dark:text-zinc-300",
                )}
              >
                🏷️ {c}
              </button>
            ))}
          </div>
        )}
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="أو اكتب فئة جديدة…"
          maxLength={40}
          className="field mt-2 py-2.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 block min-w-0 sm:col-span-1">
          <Label>التاريخ</Label>
          <input name="date" type="date" required defaultValue={expense?.date ?? today} max="2100-12-31" className="field" />
        </label>
        <label className="col-span-2 block min-w-0 sm:col-span-1">
          <Label hint="اختياري">ملاحظة</Label>
          <input name="note" defaultValue={expense?.note} maxLength={200} placeholder="مثلاً: غداء مع الأصدقاء" className="field" />
        </label>
      </div>

      <div className="flex gap-3 pt-1">
        {expense && (
          <button
            type="button"
            disabled={pending}
            onClick={() => confirm("حذف هذا المصروف؟") && run(() => deleteExpense(expense.id), onDone)}
            className="btn bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
            aria-label="حذف المصروف"
          >
            <Trash2 className="size-5" />
          </button>
        )}
        <button type="submit" disabled={pending} className="btn-primary flex-1 py-3.5 text-base">
          {pending && <Loader2 className="size-5 animate-spin" />}
          {expense ? "حفظ التعديلات" : "إضافة المصروف"}
        </button>
      </div>
    </form>
  );
}
