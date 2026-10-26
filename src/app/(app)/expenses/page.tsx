import type { Metadata } from "next";
import { expenseCategories, expenseStats, listExpenses } from "@/lib/data";
import { monthEnd, todayISO } from "@/lib/dates";
import { ExpensesClient } from "./ExpensesClient";

export const metadata: Metadata = { title: "المصاريف" };

export default async function ExpensesPage({ searchParams }: PageProps<"/expenses">) {
  const sp = await searchParams;
  const today = todayISO();
  const month = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? `${sp.month}-01` : `${today.slice(0, 7)}-01`;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const from = month;
  const to = monthEnd(month);

  const [expenses, stats, categories] = await Promise.all([
    listExpenses({ from, to, q: q || undefined, category: category || undefined }),
    expenseStats(from, to),
    expenseCategories(),
  ]);

  return (
    <ExpensesClient
        expenses={expenses}
        today={today}
        month={month}
        monthTotal={stats.total}
        byCategory={stats.byCategory}
        categories={categories}
        q={q}
        category={category}
    />
  );
}
