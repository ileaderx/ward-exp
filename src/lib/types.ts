import type { DebtDirection } from "@/models/Debt";

export type ExpenseItem = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
};

export type PaymentItem = { id: string; amount: number; date: string; note: string };

export type DebtItem = {
  id: string;
  person: string;
  personKey: string;
  direction: DebtDirection;
  amount: number;
  paid: number;
  remaining: number;
  note: string;
  date: string;
  dueDate: string | null;
  settled: boolean;
  payments: PaymentItem[];
};

export type PersonSummary = {
  key: string;
  person: string;
  owedToMe: number;
  iOwe: number;
  net: number;
  openCount: number;
  totalCount: number;
  lastDate: string;
};

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };
