import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, formatMonth } from "@/lib/dates";

export function MonthSwitcher({ month, current, hrefFor }: { month: string; current: string; hrefFor: (month: string) => string }) {
  const prev = addMonths(month, -1).slice(0, 7);
  const next = addMonths(month, 1).slice(0, 7);
  const isCurrent = month.slice(0, 7) === current.slice(0, 7);
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-1.5 ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
      <Link href={hrefFor(prev)} className="flex size-9 items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Previous month">
        <ChevronLeft className="size-5" />
      </Link>
      <div className="text-center">
        <div className="text-sm font-semibold">{formatMonth(month)}</div>
        {!isCurrent && (
          <Link href={hrefFor(current.slice(0, 7))} className="text-xs font-medium text-brand-600">
            Back to this month
          </Link>
        )}
      </div>
      {isCurrent ? (
        <span className="size-9" />
      ) : (
        <Link href={hrefFor(next)} className="flex size-9 items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Next month">
          <ChevronRight className="size-5" />
        </Link>
      )}
    </div>
  );
}
