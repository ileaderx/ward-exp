import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowDownLeft, ArrowUpRight, CalendarClock, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { debtTotals, expenseCategories, expenseStats, listExpenses, personNames, upcomingDebts } from "@/lib/data";
import { TIME_ZONE, addDays, addMonths, formatDay, monthEnd, monthStart, relativeDayLabel, todayISO } from "@/lib/dates";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { CategoryBars, ColumnChart } from "@/components/Charts";
import { ExpenseRow } from "@/components/ExpenseRow";
import { QuickActions } from "./QuickActions";

export const metadata: Metadata = { title: "Dashboard" };

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export default async function DashboardPage() {
  const today = todayISO();
  const thisMonth = monthStart(today);
  const lastMonth = addMonths(today, -1);
  const weekStart = addDays(today, -6);
  // Same number of days into last month, for a fair comparison.
  const lastMonthSameDay = [addDays(lastMonth, Number(today.slice(8)) - 1), monthEnd(lastMonth)].sort()[0];

  const [month, prev, week, recent, debts, upcoming, categories, people] = await Promise.all([
    expenseStats(thisMonth, today),
    expenseStats(lastMonth, lastMonthSameDay),
    expenseStats(weekStart, today),
    listExpenses({ from: addDays(today, -60), to: today, limit: 5 }),
    debtTotals(),
    upcomingDebts(4),
    expenseCategories(),
    personNames(),
  ]);

  const todayTotal = week.byDay.find((d) => d.day === today)?.total ?? 0;
  const change = prev.total > 0 ? Math.round(((month.total - prev.total) / prev.total) * 100) : null;
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekData = days.map((d) => ({
    key: d,
    label: formatDay(d, { weekday: "narrow" }),
    sub: relativeDayLabel(d, today),
    value: week.byDay.find((x) => x.day === d)?.total ?? 0,
  }));

  return (
    <div className="space-y-4 pb-4">
      <PageHeader title={greeting()} subtitle={formatDay(today, { weekday: "long", day: "numeric", month: "long" })} />

      <div className="card overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-5 text-white ring-0 dark:from-brand-600 dark:via-brand-700 dark:to-indigo-950">
        <p className="text-sm font-medium text-white/75">Spent this month</p>
        <p className="tabular mt-1 text-[40px] leading-none font-bold tracking-tight">{money(month.total)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-white/15 px-2.5 py-1 font-medium">Today {money(todayTotal)}</span>
          {change !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-medium">
              {change > 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              {change > 0 ? "+" : ""}
              {change}% vs last month
            </span>
          )}
        </div>
      </div>

      <QuickActions today={today} categories={categories} people={people} />

      <div className="grid grid-cols-2 gap-3">
        <Link href="/debts" className="card p-4 transition active:scale-[0.98]">
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="size-4" /> Owed to me
          </div>
          <p className="tabular mt-1.5 text-xl font-bold tracking-tight">{money(debts.owedToMe)}</p>
          <p className="text-xs text-zinc-500">{debts.owedToMeCount} open</p>
        </Link>
        <Link href="/debts" className="card p-4 transition active:scale-[0.98]">
          <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
            <ArrowUpRight className="size-4" /> I owe
          </div>
          <p className="tabular mt-1.5 text-xl font-bold tracking-tight">{money(debts.iOwe)}</p>
          <p className="text-xs text-zinc-500">{debts.iOweCount} open</p>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-semibold">Last 7 days</h2>
            <span className="tabular text-sm text-zinc-500">{money(week.total)}</span>
          </div>
          <ColumnChart data={weekData} highlight={today} />
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-semibold">Top categories</h2>
            <Link href="/reports" className="text-sm font-semibold text-brand-600">
              Reports
            </Link>
          </div>
          {month.byCategory.length ? (
            <CategoryBars data={month.byCategory} total={month.total} limit={5} />
          ) : (
            <p className="py-8 text-center text-sm text-zinc-500">No spending this month yet.</p>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section>
          <div className="mb-1.5 flex items-baseline justify-between px-1">
            <h2 className="font-semibold">Recent expenses</h2>
            <Link href="/expenses" className="inline-flex items-center text-sm font-semibold text-brand-600">
              See all <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="card divide-y divide-black/5 overflow-hidden dark:divide-white/5">
            {recent.length ? (
              recent.map((e) => <ExpenseRow key={e.id} expense={e} sub={`${e.category} · ${relativeDayLabel(e.date, today)}`} />)
            ) : (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">Nothing yet — add your first expense above.</p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-1.5 flex items-baseline justify-between px-1">
            <h2 className="font-semibold">Due soon</h2>
            <Link href="/debts" className="inline-flex items-center text-sm font-semibold text-brand-600">
              Debts <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="card divide-y divide-black/5 overflow-hidden dark:divide-white/5">
            {upcoming.length ? (
              upcoming.map((d) => {
                const overdue = d.dueDate! < today;
                return (
                  <Link key={d.id} href={`/debts/${encodeURIComponent(d.personKey)}`} className="flex items-center gap-3 px-4 py-3">
                    <span className={clsx("flex size-10 items-center justify-center rounded-xl", overdue ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800")}>
                      <CalendarClock className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{d.person}</span>
                      <span className={clsx("block text-xs", overdue ? "font-medium text-rose-600" : "text-zinc-500")}>
                        {overdue ? "Overdue · " : "Due "}
                        {formatDay(d.dueDate!)} · {d.direction === "owed_to_me" ? "owes you" : "you owe"}
                      </span>
                    </span>
                    <span className="tabular font-semibold">{money(d.remaining)}</span>
                  </Link>
                );
              })
            ) : (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">No debts with a due date.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
