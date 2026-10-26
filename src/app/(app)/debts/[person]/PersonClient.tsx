"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowDownLeft, ArrowUpRight, CalendarClock, CheckCircle2, ChevronRight, HandCoins, Pencil, Plus, X } from "lucide-react";
import { deletePayment } from "@/lib/actions";
import { formatDay } from "@/lib/dates";
import { money, roundMoney } from "@/lib/format";
import { personKey } from "@/lib/people";
import type { DebtItem } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { Sheet } from "@/components/Sheet";
import { DebtForm } from "@/components/DebtForm";
import { PaymentForm } from "@/components/PaymentForm";
import { useSubmit } from "@/components/useSubmit";

type Mode = { kind: "add" } | { kind: "edit"; debt: DebtItem } | { kind: "pay"; debt: DebtItem } | null;

export function PersonClient({ debts, people, today }: { debts: DebtItem[]; people: string[]; today: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const close = useCallback(() => setMode(null), []);
  const { pending, run } = useSubmit();

  const name = debts[0].person;
  const owedToMe = roundMoney(debts.filter((d) => d.direction === "owed_to_me").reduce((s, d) => s + d.remaining, 0));
  const iOwe = roundMoney(debts.filter((d) => d.direction === "i_owe").reduce((s, d) => s + d.remaining, 0));
  const net = roundMoney(owedToMe - iOwe);

  return (
    <div className="space-y-4 pt-4 pb-4 md:pt-8">
      <div className="no-print flex items-center justify-between">
        <Link href="/debts" className="inline-flex items-center gap-1 rounded-full py-2 pe-3 text-sm font-semibold text-brand-600">
          <ChevronRight className="size-5" />
          الديون
        </Link>
        <button onClick={() => setMode({ kind: "add" })} className="btn-ghost py-2">
          <Plus className="size-4" />
          دين جديد
        </button>
      </div>

      <div className="card flex flex-col items-center p-6 text-center">
        <Avatar name={name} size="lg" />
        <h1 className="mt-3 text-2xl font-bold">{name}</h1>
        {net === 0 ? (
          <p className="mt-1 text-sm font-medium text-zinc-500">متعادلين — لا يوجد شيء مفتوح</p>
        ) : (
          <>
            <p className={clsx("tabular mt-2 text-4xl font-bold", net > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
              {money(Math.abs(net))}
            </p>
            <p className="text-sm text-zinc-500">{net > 0 ? `لك عند ${name}` : `عليك لـ ${name}`}</p>
          </>
        )}
        {owedToMe > 0 && iOwe > 0 && (
          <p className="mt-2 text-xs text-zinc-500">
            لك عنده {money(owedToMe)} · عليك له {money(iOwe)}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {debts.map((d) => {
          const incoming = d.direction === "owed_to_me";
          const pct = Math.min(100, Math.round((d.paid / d.amount) * 100));
          const overdue = !d.settled && d.dueDate && d.dueDate < today;
          return (
            <div key={d.id} className={clsx("card p-4", d.settled && "opacity-70")}>
              <div className="flex items-start gap-3">
                <span
                  className={clsx(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    incoming ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
                  )}
                >
                  {incoming ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold">{incoming ? "أقرضته" : "استلفت منه"}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {formatDay(d.date)}
                        {d.note && ` · ${d.note}`}
                      </p>
                    </div>
                    <p className="tabular shrink-0 text-lg font-bold">{money(d.amount)}</p>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className={clsx("h-full rounded-full", incoming ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1.5 flex justify-between text-xs text-zinc-500">
                    <span className="tabular">المدفوع {money(d.paid)}</span>
                    {d.settled ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <CheckCircle2 className="size-3.5" /> مسدد
                      </span>
                    ) : (
                      <span className="tabular font-semibold text-zinc-700 dark:text-zinc-300">المتبقي {money(d.remaining)}</span>
                    )}
                  </div>
                  {d.dueDate && !d.settled && (
                    <p className={clsx("mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", overdue ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300")}>
                      <CalendarClock className="size-3.5" />
                      {overdue ? "متأخر · " : "موعد السداد "}
                      {formatDay(d.dueDate)}
                    </p>
                  )}

                  {d.payments.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-black/5 pt-2 dark:border-white/5">
                      {d.payments.map((p) => (
                        <li key={p.id} className="flex items-center gap-2 text-xs text-zinc-500">
                          <span className="tabular font-medium text-zinc-700 dark:text-zinc-300">{money(p.amount)}</span>
                          <span className="min-w-0 flex-1 truncate">
                            {formatDay(p.date)}
                            {p.note && ` · ${p.note}`}
                          </span>
                          <button
                            disabled={pending}
                            onClick={() => confirm("حذف هذه الدفعة؟") && run(() => deletePayment(d.id, p.id))}
                            className="no-print rounded-full p-1 text-zinc-400 hover:text-rose-500"
                            aria-label="حذف الدفعة"
                          >
                            <X className="size-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="no-print mt-3 flex gap-2">
                    {!d.settled && (
                      <button onClick={() => setMode({ kind: "pay", debt: d })} className="btn-primary flex-1 py-2.5">
                        <HandCoins className="size-4" />
                        {incoming ? "استلمت دفعة" : "دفعت له"}
                      </button>
                    )}
                    <button onClick={() => setMode({ kind: "edit", debt: d })} className="btn-ghost py-2.5" aria-label="تعديل الدين">
                      <Pencil className="size-4" />
                      {d.settled && "تعديل"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={mode !== null} onClose={close} title={mode?.kind === "pay" ? "تسجيل دفعة" : mode?.kind === "edit" ? "تعديل الدين" : `دين جديد مع ${name}`}>
        {mode?.kind === "add" && <DebtForm today={today} people={people} defaultPerson={name} onDone={close} />}
        {mode?.kind === "edit" && (
          <DebtForm
            key={mode.debt.id}
            debt={mode.debt}
            today={today}
            people={people}
            onDone={(person) => {
              close();
              // Renaming moves the debt to another person's page.
              if (personKey(person) !== debts[0].personKey && debts.length === 1) {
                router.replace(`/debts/${encodeURIComponent(personKey(person))}`);
              }
            }}
          />
        )}
        {mode?.kind === "pay" && <PaymentForm key={mode.debt.id} debt={mode.debt} today={today} onDone={close} />}
      </Sheet>
    </div>
  );
}
