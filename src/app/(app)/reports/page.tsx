import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { Download } from "lucide-react";
import { debtActivity, debtTotals, expenseStats, listExpenses, peopleSummary } from "@/lib/data";
import { addDays, formatDay, formatMonth } from "@/lib/dates";
import { money } from "@/lib/format";
import { PRESETS, daysBetween, resolveRange } from "@/lib/ranges";
import { PageHeader } from "@/components/PageHeader";
import { CategoryBars, ColumnChart } from "@/components/Charts";
import { ExpenseRow } from "@/components/ExpenseRow";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = { title: "التقارير" };

export default async function ReportsPage({ searchParams }: PageProps<"/reports">) {
  const range = resolveRange(await searchParams);
  const { from, to } = range;
  const span = daysBetween(from, to);

  const [stats, activity, totals, people, top] = await Promise.all([
    expenseStats(from, to),
    debtActivity(from, to),
    debtTotals(),
    peopleSummary(),
    listExpenses({ from, to }),
  ]);

  const biggest = [...top].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const avgPerDay = stats.total / span;
  const byMonth = span > 62;
  const trend = byMonth
    ? stats.byMonth.map((m) => ({ key: m.month, label: formatMonth(`${m.month}-01`).slice(0, 3), sub: formatMonth(`${m.month}-01`), value: m.total }))
    : Array.from({ length: span }, (_, i) => {
        const d = addDays(from, i);
        return { key: d, label: span <= 10 || i % 5 === 0 ? d.slice(8) : "", sub: formatDay(d), value: stats.byDay.find((x) => x.day === d)?.total ?? 0 };
      });
  const openPeople = people.filter((p) => p.net !== 0);

  return (
    <div className="space-y-4 pb-4">
      <PageHeader
        title="التقارير"
        subtitle={`${formatDay(from)} – ${formatDay(to)}`}
        action={
          <>
            <a href={`/api/export?from=${from}&to=${to}`} className="btn-ghost px-3 py-2.5" aria-label="تنزيل ملف Excel">
              <Download className="size-4" />
              <span className="hidden sm:inline">Excel</span>
            </a>
            <PrintButton />
          </>
        }
      />

      <div className="no-print -mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {PRESETS.map((p) => (
          <Link
            key={p.id}
            replace
            href={`/reports?range=${p.id}`}
            className={clsx(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ring-1",
              range.id === p.id ? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900" : "bg-white text-zinc-600 ring-black/5 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10",
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <form action="/reports" className="no-print card flex flex-wrap items-end gap-3 p-4">
        <label className="min-w-0 flex-1 basis-32">
          <span className="mb-1 block text-xs font-medium text-zinc-500">من</span>
          <input type="date" name="from" defaultValue={from} required className="field py-2.5" />
        </label>
        <label className="min-w-0 flex-1 basis-32">
          <span className="mb-1 block text-xs font-medium text-zinc-500">إلى</span>
          <input type="date" name="to" defaultValue={to} required className="field py-2.5" />
        </label>
        <button className="btn-primary w-full py-2.5 sm:w-auto">عرض</button>
      </form>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="مجموع المصاريف" value={money(stats.total)} tone="text-rose-600 dark:text-rose-400" />
        <Stat label="المعدل اليومي" value={money(avgPerDay)} />
        <Stat label="عدد المصاريف" value={String(stats.count)} />
        <Stat label="أعلى فئة" value={stats.byCategory[0]?.category ?? "—"} />
      </div>

      <section className="card p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-semibold">{byMonth ? "المصاريف حسب الشهر" : "المصاريف حسب اليوم"}</h2>
          <span className="text-sm text-zinc-500">{span} يوم</span>
        </div>
        {stats.count ? <ColumnChart data={trend} /> : <p className="py-8 text-center text-sm text-zinc-500">لا توجد مصاريف في هذه الفترة.</p>}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-4 font-semibold">حسب الفئة</h2>
          {stats.byCategory.length ? <CategoryBars data={stats.byCategory} total={stats.total} /> : <p className="py-6 text-center text-sm text-zinc-500">لا يوجد شيء لعرضه.</p>}
        </section>

        <section>
          <h2 className="mb-1.5 px-1 font-semibold">أكبر المصاريف</h2>
          <div className="card divide-y divide-black/5 overflow-hidden dark:divide-white/5">
            {biggest.length ? (
              biggest.map((e) => <ExpenseRow key={e.id} expense={e} sub={`${e.category} · ${formatDay(e.date)}`} />)
            ) : (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">لا يوجد شيء لعرضه.</p>
            )}
          </div>
        </section>
      </div>

      <section className="card p-5">
        <h2 className="mb-4 font-semibold">الديون في هذه الفترة</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="أقرضت" value={activity.lent} />
          <MiniStat label="استرجعت" value={activity.received} />
          <MiniStat label="استلفت" value={activity.borrowed} />
          <MiniStat label="سددت" value={activity.repaid} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-black/5 pt-4 dark:border-white/5">
          <div>
            <p className="text-xs text-zinc-500">المتبقي لي عند الناس (الكل)</p>
            <p className="tabular text-lg font-bold text-emerald-600 dark:text-emerald-400">{money(totals.owedToMe)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">المتبقي علي للناس (الكل)</p>
            <p className="tabular text-lg font-bold text-amber-600 dark:text-amber-400">{money(totals.iOwe)}</p>
          </div>
        </div>
        {openPeople.length > 0 && (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-start text-xs text-zinc-500">
                <th className="pb-2 font-medium">الشخص</th>
                <th className="pb-2 text-end font-medium">لي عنده</th>
                <th className="pb-2 text-end font-medium">علي له</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {openPeople.map((p) => (
                <tr key={p.key}>
                  <td className="py-2 font-medium">
                    <Link href={`/debts/${encodeURIComponent(p.key)}`}>{p.person}</Link>
                  </td>
                  <td className="tabular py-2 text-end">{p.owedToMe ? money(p.owedToMe) : "—"}</td>
                  <td className="tabular py-2 text-end">{p.iOwe ? money(p.iOwe) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className={clsx("tabular mt-1 truncate text-xl font-bold", tone)}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="tabular font-semibold">{money(value)}</p>
    </div>
  );
}
