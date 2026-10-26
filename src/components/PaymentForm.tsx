"use client";

import { useRef } from "react";
import { Loader2 } from "lucide-react";
import { addPayment } from "@/lib/actions";
import { money } from "@/lib/format";
import type { DebtItem } from "@/lib/types";
import { AmountInput, Label } from "@/components/Field";
import { useSubmit } from "@/components/useSubmit";

export function PaymentForm({ debt, today, onDone }: { debt: DebtItem; today: string; onDone: () => void }) {
  const { pending, run } = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const incoming = debt.direction === "owed_to_me";

  return (
    <form ref={formRef} action={(fd) => run(() => addPayment(fd), onDone)} className="space-y-5">
      <input type="hidden" name="debtId" value={debt.id} />
      <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        {incoming ? `${debt.person} رجّع لك` : `أنت دفعت لـ ${debt.person}`}. المتبقي: <b className="tabular">{money(debt.remaining)}</b>
      </p>
      <div>
        <Label>المبلغ المدفوع</Label>
        <AmountInput autoFocus max={debt.remaining} />
        <button
          type="button"
          onClick={() => {
            const input = formRef.current?.elements.namedItem("amount") as HTMLInputElement | null;
            if (input) input.value = String(debt.remaining);
          }}
          className="mt-2 text-sm font-semibold text-brand-600"
        >
          تعبئة المبلغ كاملاً ({money(debt.remaining)})
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <Label>التاريخ</Label>
          <input name="date" type="date" required defaultValue={today} className="field" />
        </label>
        <label className="block">
          <Label hint="اختياري">ملاحظة</Label>
          <input name="note" maxLength={200} placeholder="كاش، تحويل…" className="field" />
        </label>
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full py-3.5 text-base">
        {pending && <Loader2 className="size-5 animate-spin" />}
        تسجيل الدفعة
      </button>
    </form>
  );
}
