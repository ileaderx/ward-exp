import { categoryEmoji } from "@/lib/categories";
import { money } from "@/lib/format";
import type { ExpenseItem } from "@/lib/types";

export function ExpenseRow({ expense, onClick, sub }: { expense: ExpenseItem; onClick?: () => void; sub?: string }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-start transition active:bg-zinc-50 dark:active:bg-zinc-800">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xl dark:bg-zinc-800">{categoryEmoji(expense.category)}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{expense.note || expense.category}</span>
        <span className="block truncate text-xs text-zinc-500">{sub ?? expense.category}</span>
      </span>
      <span className="tabular shrink-0 font-semibold">{money(expense.amount)}</span>
    </Tag>
  );
}
