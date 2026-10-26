import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listDebts, personNames } from "@/lib/data";
import { todayISO } from "@/lib/dates";
import { PersonClient } from "./PersonClient";

export async function generateMetadata({ params }: PageProps<"/debts/[person]">): Promise<Metadata> {
  const { person } = await params;
  return { title: decodeURIComponent(person) };
}

export default async function PersonPage({ params }: PageProps<"/debts/[person]">) {
  const key = decodeURIComponent((await params).person);
  const [debts, people] = await Promise.all([listDebts({ personKey: key, status: "all" }), personNames()]);
  // Last debt deleted or renamed away: go back to the list.
  if (debts.length === 0) redirect("/debts");
  return <PersonClient debts={debts} people={people} today={todayISO()} />;
}
