import type { Metadata } from "next";
import { debtTotals, peopleSummary } from "@/lib/data";
import { todayISO } from "@/lib/dates";
import { DebtsClient } from "./DebtsClient";

export const metadata: Metadata = { title: "Debts" };

export default async function DebtsPage({ searchParams }: PageProps<"/debts">) {
  const { show } = await searchParams;
  const [people, totals] = await Promise.all([peopleSummary(), debtTotals()]);
  return <DebtsClient people={people} totals={totals} today={todayISO()} showSettled={show === "all"} />;
}
