"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Search, X } from "lucide-react";
import type { ExpenseItem } from "@/lib/types";
import { money } from "@/lib/format";
import { relativeDayLabel } from "@/lib/dates";
import { categoryEmoji } from "@/lib/categories";
import { Sheet } from "@/components/Sheet";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseRow } from "@/components/ExpenseRow";
import { AddButton } from "@/components/AddButton";
import { MonthSwitcher } from "@/components/MonthSwitcher";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

type Props = {
  expenses: ExpenseItem[];
  today: string;
  month: string;
  monthTotal: number;
  byCategory: { category: string; total: number; count: number }[];
  categories: string[];
  q: string;
  category: string;
};

export function ExpensesClient({ expenses, today, month, monthTotal, byCategory, categories, q, category }: Props) {
  const [editing, setEditing] = useState<ExpenseItem | "new" | null>(null);
  const close = useCallback(() => setEditing(null), []);

  const params = (over: Record<string, string>) => {
    const p = new URLSearchParams({ month: month.slice(0, 7), ...(q && { q }), ...(category && { category }), ...over });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    return `/expenses?${p}`;
  };

  const days = new Map<string, ExpenseItem[]>();
  for (const e of expenses) days.set(e.date, [...(days.get(e.date) ?? []), e]);
  const filteredTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4 pb-4">
      <PageHeader title="المصاريف" subtitle="مصاريفك اليومية" action={<AddButton onClick={() => setEditing("new")} label="إضافة مصروف" />} />

      <MonthSwitcher month={month} current={today} hrefFor={(m) => params({ month: m })} />

      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white">
          <p className="text-sm font-medium text-white/80">{q || category ? "مجموع النتائج" : "مصاريف هذا الشهر"}</p>
          <p className="tabular mt-1 text-4xl font-bold">{money(q || category ? filteredTotal : monthTotal)}</p>
          <p className="mt-1 text-sm text-white/80">
            {expenses.length} {expenses.length === 1 ? "مصروف" : "مصاريف"}
          </p>
        </div>
        {byCategory.length > 0 && (
          <div className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:none]">
            <Link
              href={params({ category: "" })}
              className={clsx("shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold", !category ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300")}
            >
              الكل
            </Link>
            {byCategory.map((c) => (
              <Link
                key={c.category}
                href={params({ category: category === c.category ? "" : c.category })}
                className={clsx(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
                  category === c.category ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
                )}
              >
                {categoryEmoji(c.category)} {c.category} · {money(c.total)}
              </Link>
            ))}
          </div>
        )}
      </div>

      <form action="/expenses" className="relative">
        <input type="hidden" name="month" value={month.slice(0, 7)} />
        {category && <input type="hidden" name="category" value={category} />}
        <Search className="pointer-events-none absolute top-1/2 start-4 size-5 -translate-y-1/2 text-zinc-400" />
        <input name="q" defaultValue={q} key={q} placeholder="ابحث في الملاحظات…" className="field bg-white pe-12 ps-12 ring-black/5 dark:bg-zinc-900" enterKeyHint="search" />
        {q && (
          <Link href={params({ q: "" })} className="absolute top-1/2 end-3 -translate-y-1/2 rounded-full p-1.5 text-zinc-400" aria-label="مسح البحث">
            <X className="size-4" />
          </Link>
        )}
      </form>

      {expenses.length === 0 ? (
        <EmptyState emoji="🧾" title={q || category ? "لا توجد نتائج" : "لا توجد مصاريف بعد"} text={q || category ? "جرّب بحثاً أو فئة أخرى." : "اضغط + لإضافة أول مصروف لهذا الشهر."} />
      ) : (
        [...days.entries()].map(([day, items]) => (
          <section key={day}>
            <div className="mb-1.5 flex items-baseline justify-between px-1">
              <h3 className="text-sm font-semibold text-zinc-500">{relativeDayLabel(day, today)}</h3>
              <span className="tabular text-sm font-medium text-zinc-500">{money(items.reduce((s, e) => s + e.amount, 0))}</span>
            </div>
            <div className="card divide-y divide-black/5 overflow-hidden dark:divide-white/5">
              {items.map((e) => (
                <ExpenseRow key={e.id} expense={e} onClick={() => setEditing(e)} />
              ))}
            </div>
          </section>
        ))
      )}

      <Sheet open={editing !== null} onClose={close} title={editing === "new" ? "مصروف جديد" : "تعديل المصروف"}>
        {editing !== null && (
          <ExpenseForm
            key={editing === "new" ? "new" : editing.id}
            expense={editing === "new" ? undefined : editing}
            today={today}
            customCategories={categories}
            onDone={close}
          />
        )}
      </Sheet>
    </div>
  );
}
