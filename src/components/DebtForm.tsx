"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import { ArrowDownLeft, ArrowUpRight, Loader2, Trash2 } from "lucide-react";
import { deleteDebt, saveDebt } from "@/lib/actions";
import type { DebtItem } from "@/lib/types";
import type { DebtDirection } from "@/models/Debt";
import { AmountInput, Label } from "@/components/Field";
import { useSubmit } from "@/components/useSubmit";

export function DebtForm({
  debt,
  today,
  people,
  defaultPerson,
  onDone,
  onDeleted,
}: {
  debt?: DebtItem;
  today: string;
  people: string[];
  defaultPerson?: string;
  onDone: (person: string) => void;
  onDeleted?: () => void;
}) {
  const { pending, run } = useSubmit();
  const listId = useId();
  const [direction, setDirection] = useState<DebtDirection>(debt?.direction ?? "owed_to_me");
  const [person, setPerson] = useState(debt?.person ?? defaultPerson ?? "");
  const suggestions = people.filter((p) => p.toLowerCase().includes(person.trim().toLowerCase()) && p !== person).slice(0, 6);

  return (
    <form
      action={(fd) => {
        fd.set("direction", direction);
        run(() => saveDebt(fd), () => onDone(person));
      }}
      className="space-y-5"
    >
      {debt && <input type="hidden" name="id" value={debt.id} />}

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {(
          [
            { value: "owed_to_me", label: "لي عنده", icon: ArrowDownLeft, on: "bg-emerald-500 text-white" },
            { value: "i_owe", label: "علي له", icon: ArrowUpRight, on: "bg-amber-500 text-white" },
          ] as const
        ).map((o) => (
          <button
            type="button"
            key={o.value}
            onClick={() => setDirection(o.value)}
            className={clsx(
              "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition",
              direction === o.value ? `${o.on} shadow-sm` : "text-zinc-500",
            )}
          >
            <o.icon className="size-4" />
            {o.label}
          </button>
        ))}
      </div>

      <label className="block">
        <Label>اسم الشخص</Label>
        <input
          name="person"
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          list={listId}
          required
          maxLength={60}
          autoComplete="off"
          autoCapitalize="words"
          placeholder="اكتب اسم الشخص"
          className="field"
        />
        <datalist id={listId}>
          {people.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((p) => (
              <button type="button" key={p} onClick={() => setPerson(p)} className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {p}
              </button>
            ))}
          </div>
        )}
      </label>

      <div>
        <Label>المبلغ</Label>
        <AmountInput defaultValue={debt?.amount} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <Label>التاريخ</Label>
          <input name="date" type="date" required defaultValue={debt?.date ?? today} className="field" />
        </label>
        <label className="block">
          <Label hint="اختياري">تاريخ السداد</Label>
          <input name="dueDate" type="date" defaultValue={debt?.dueDate ?? ""} className="field" />
        </label>
      </div>

      <label className="block">
        <Label hint="اختياري">ملاحظة</Label>
        <input name="note" defaultValue={debt?.note} maxLength={200} placeholder="مثلاً: سلفة لتصليح السيارة" className="field" />
      </label>

      <div className="flex gap-3 pt-1">
        {debt && (
          <button
            type="button"
            disabled={pending}
            onClick={() => confirm("حذف هذا الدين وكل دفعاته؟") && run(() => deleteDebt(debt.id), onDeleted ?? (() => onDone(person)))}
            className="btn bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
            aria-label="حذف الدين"
          >
            <Trash2 className="size-5" />
          </button>
        )}
        <button type="submit" disabled={pending} className="btn-primary flex-1 py-3.5 text-base">
          {pending && <Loader2 className="size-5 animate-spin" />}
          {debt ? "حفظ التعديلات" : "إضافة الدين"}
        </button>
      </div>
    </form>
  );
}
