"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, Search } from "lucide-react";
import { money } from "@/lib/format";
import type { PersonSummary } from "@/lib/types";
import { Sheet } from "@/components/Sheet";
import { DebtForm } from "@/components/DebtForm";
import { AddButton } from "@/components/AddButton";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

type Props = {
  people: PersonSummary[];
  totals: { owedToMe: number; owedToMeCount: number; iOwe: number; iOweCount: number };
  today: string;
  showSettled: boolean;
};

export function DebtsClient({ people, totals, today, showSettled }: Props) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const close = useCallback(() => setAdding(false), []);

  const open = people.filter((p) => p.openCount > 0);
  const settled = people.filter((p) => p.openCount === 0);
  const match = (p: PersonSummary) => p.person.toLowerCase().includes(query.trim().toLowerCase());
  const visible = (showSettled ? [...open, ...settled] : open).filter(match);

  return (
    <div className="space-y-4 pb-4">
      <PageHeader title="الديون" subtitle="لك وعليك" action={<AddButton onClick={() => setAdding(true)} label="إضافة دين" />} />

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
              <ArrowDownLeft className="size-4" />
            </span>
            لي عند الناس
          </div>
          <p className="tabular mt-2 text-2xl font-bold">{money(totals.owedToMe)}</p>
          <p className="text-xs text-zinc-500">{totals.owedToMeCount} مفتوح</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
            <span className="flex size-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
              <ArrowUpRight className="size-4" />
            </span>
            علي للناس
          </div>
          <p className="tabular mt-2 text-2xl font-bold">{money(totals.iOwe)}</p>
          <p className="text-xs text-zinc-500">{totals.iOweCount} مفتوح</p>
        </div>
      </div>

      {people.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 start-4 size-5 -translate-y-1/2 text-zinc-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن شخص…" className="field bg-white ps-12 dark:bg-zinc-900" />
          </div>
          <div className="flex shrink-0 rounded-xl bg-white p-1 text-xs font-semibold ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
            <Link replace href="/debts" className={clsx("rounded-lg px-3 py-2", !showSettled ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-500")}>
              المفتوحة
            </Link>
            <Link replace href="/debts?show=all" className={clsx("rounded-lg px-3 py-2", showSettled ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-500")}>
              الكل
            </Link>
          </div>
        </div>
      )}

      {people.length === 0 ? (
        <EmptyState emoji="🤝" title="لا توجد ديون بعد" text="سجّل المبالغ التي أقرضتها أو استلفتها. فقط اكتب اسم الشخص والمبلغ.">
          <button onClick={() => setAdding(true)} className="btn-primary">
            إضافة أول دين
          </button>
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState emoji={query ? "🔎" : "🎉"} title={query ? "لا يوجد أحد بهذا الاسم" : "كل الديون مسددة"} text={query ? "جرّب اسماً آخر." : "لا توجد ديون مفتوحة. اضغط «الكل» لعرض السجل."} />
      ) : (
        <div className="card divide-y divide-black/5 overflow-hidden dark:divide-white/5">
          {visible.map((p) => (
            <Link key={p.key} href={`/debts/${encodeURIComponent(p.key)}`} className="flex items-center gap-3 px-4 py-3.5 transition active:bg-zinc-50 dark:active:bg-zinc-800">
              <Avatar name={p.person} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{p.person}</span>
                <span className="block text-xs text-zinc-500">
                  {p.openCount > 0 ? `${p.openCount} مفتوح · ` : "مسدد · "}
                  {p.totalCount} الإجمالي
                </span>
              </span>
              <span className="text-end">
                {p.net === 0 ? (
                  <span className="text-sm font-medium text-zinc-400">متعادلين</span>
                ) : (
                  <>
                    <span className={clsx("tabular block font-bold", p.net > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                      {money(Math.abs(p.net))}
                    </span>
                    <span className="block text-[11px] text-zinc-500">{p.net > 0 ? "لك عنده" : "عليك له"}</span>
                  </>
                )}
              </span>
              <ChevronLeft className="size-4 text-zinc-300" />
            </Link>
          ))}
        </div>
      )}

      <Sheet open={adding} onClose={close} title="دين جديد">
        {adding && (
<DebtForm today={today} people={people.map((p) => p.person)} onDone={close} />
        )}
      </Sheet>
    </div>
  );
}
