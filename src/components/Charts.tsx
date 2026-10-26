import { categoryEmoji } from "@/lib/categories";
import { money, moneyCompact } from "@/lib/format";

// Single-series column chart: one hue, rounded data-end, hover/tap tooltip per bar.
export function ColumnChart({ data, highlight }: { data: { label: string; sub?: string; value: number; key: string }[]; highlight?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-40 items-end gap-[2px]" role="img" aria-label="المصاريف حسب الفترة">
      {data.map((d) => {
        const h = d.value > 0 ? Math.max(4, (d.value / max) * 100) : 0;
        return (
          <div key={d.key} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end" tabIndex={0}>
            <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-lg bg-zinc-900 px-2 py-1 text-center text-[11px] whitespace-nowrap text-white shadow-lg group-hover:block group-focus:block dark:bg-zinc-700">
              <div className="font-semibold">{money(d.value)}</div>
              <div className="text-white/70">{d.sub ?? d.label}</div>
            </div>
            <div className="flex w-full flex-1 items-end justify-center px-[10%]">
              <div
                className={
                  d.key === highlight
                    ? "w-full max-w-8 rounded-t-[4px] bg-brand-600 dark:bg-brand-500"
                    : "w-full max-w-8 rounded-t-[4px] bg-brand-500/45 group-hover:bg-brand-500/70 dark:bg-brand-500/50"
                }
                style={{ height: `${h}%` }}
              />
            </div>
            <div className="mt-1.5 h-4 text-center text-[10px] whitespace-nowrap text-zinc-500">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// Horizontal bars for a category breakdown; labels and values stay in text ink.
export function CategoryBars({ data, total, limit }: { data: { category: string; total: number; count: number }[]; total: number; limit?: number }) {
  const rows = limit ? data.slice(0, limit) : data;
  const max = Math.max(...rows.map((r) => r.total), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.category}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="min-w-0 truncate font-medium">
              {categoryEmoji(r.category)} {r.category}
              <span className="ms-1.5 text-xs font-normal text-zinc-500">
                <bdi dir="ltr">{total > 0 ? Math.round((r.total / total) * 100) : 0}%</bdi> · {r.count} مرة
              </span>
            </span>
            <span className="tabular shrink-0 font-semibold">{moneyCompact(r.total)}</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(2, (r.total / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
