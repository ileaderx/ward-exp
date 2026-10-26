import "server-only";
import { connectDB } from "@/lib/mongodb";
import { parseDay, toISODay } from "@/lib/dates";
import { round2 } from "@/lib/format";
import Expense, { type ExpenseDoc } from "@/models/Expense";
import Debt, { type DebtDoc } from "@/models/Debt";
import type { DebtItem, ExpenseItem, PersonSummary } from "@/lib/types";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rangeFilter(from: string, to: string) {
  const end = parseDay(to);
  end.setUTCDate(end.getUTCDate() + 1);
  return { $gte: parseDay(from), $lt: end };
}

export function toExpenseItem(doc: ExpenseDoc): ExpenseItem {
  return {
    id: doc._id.toString(),
    amount: doc.amount,
    category: doc.category,
    note: doc.note ?? "",
    date: toISODay(doc.date),
  };
}

export function toDebtItem(doc: DebtDoc): DebtItem {
  return {
    id: doc._id.toString(),
    person: doc.person,
    personKey: doc.personKey,
    direction: doc.direction,
    amount: doc.amount,
    paid: doc.paid,
    remaining: round2(doc.amount - doc.paid),
    note: doc.note ?? "",
    date: toISODay(doc.date),
    dueDate: doc.dueDate ? toISODay(doc.dueDate) : null,
    settled: doc.settled,
    payments: (doc.payments ?? [])
      .map((p) => ({ id: p._id!.toString(), amount: p.amount, date: toISODay(p.date), note: p.note ?? "" }))
      .sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export async function listExpenses(opts: { from: string; to: string; q?: string; category?: string; limit?: number }) {
  await connectDB();
  const filter: Record<string, unknown> = { date: rangeFilter(opts.from, opts.to) };
  if (opts.category) filter.category = opts.category;
  if (opts.q) {
    const rx = new RegExp(escapeRegex(opts.q), "i");
    filter.$or = [{ note: rx }, { category: rx }];
  }
  const query = Expense.find(filter).sort({ date: -1, createdAt: -1 });
  if (opts.limit) query.limit(opts.limit);
  const docs = await query.lean<ExpenseDoc[]>();
  return docs.map(toExpenseItem);
}

export async function expenseStats(from: string, to: string) {
  await connectDB();
  const [result] = await Expense.aggregate<{
    total: { sum: number; count: number }[];
    byCategory: { _id: string; sum: number; count: number }[];
    byDay: { _id: string; sum: number }[];
    byMonth: { _id: string; sum: number }[];
  }>([
    { $match: { date: rangeFilter(from, to) } },
    {
      $facet: {
        total: [{ $group: { _id: null, sum: { $sum: "$amount" }, count: { $sum: 1 } } }],
        byCategory: [{ $group: { _id: "$category", sum: { $sum: "$amount" }, count: { $sum: 1 } } }, { $sort: { sum: -1 } }],
        byDay: [
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, sum: { $sum: "$amount" } } },
          { $sort: { _id: 1 } },
        ],
        byMonth: [
          { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, sum: { $sum: "$amount" } } },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);
  return {
    total: round2(result.total[0]?.sum ?? 0),
    count: result.total[0]?.count ?? 0,
    byCategory: result.byCategory.map((c) => ({ category: c._id, total: round2(c.sum), count: c.count })),
    byDay: result.byDay.map((d) => ({ day: d._id, total: round2(d.sum) })),
    byMonth: result.byMonth.map((m) => ({ month: m._id, total: round2(m.sum) })),
  };
}

export async function expenseCategories() {
  await connectDB();
  const used = (await Expense.distinct("category")) as string[];
  return used.sort((a, b) => a.localeCompare(b));
}

export async function listDebts(opts: { personKey?: string; status?: "open" | "settled" | "all" } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (opts.personKey) filter.personKey = opts.personKey;
  if (opts.status === "open") filter.settled = false;
  if (opts.status === "settled") filter.settled = true;
  const docs = await Debt.find(filter).sort({ settled: 1, date: -1, createdAt: -1 }).lean<DebtDoc[]>();
  return docs.map(toDebtItem);
}

export async function peopleSummary(): Promise<PersonSummary[]> {
  await connectDB();
  const rows = await Debt.aggregate<{
    _id: string;
    person: string;
    owedToMe: number;
    iOwe: number;
    openCount: number;
    totalCount: number;
    lastDate: Date;
  }>([
    { $sort: { date: -1, createdAt: -1 } },
    {
      $group: {
        _id: "$personKey",
        person: { $first: "$person" },
        owedToMe: {
          $sum: { $cond: [{ $eq: ["$direction", "owed_to_me"] }, { $subtract: ["$amount", "$paid"] }, 0] },
        },
        iOwe: { $sum: { $cond: [{ $eq: ["$direction", "i_owe"] }, { $subtract: ["$amount", "$paid"] }, 0] } },
        openCount: { $sum: { $cond: ["$settled", 0, 1] } },
        totalCount: { $sum: 1 },
        lastDate: { $max: "$date" },
      },
    },
  ]);
  return rows
    .map((r) => ({
      key: r._id,
      person: r.person,
      owedToMe: round2(r.owedToMe),
      iOwe: round2(r.iOwe),
      net: round2(r.owedToMe - r.iOwe),
      openCount: r.openCount,
      totalCount: r.totalCount,
      lastDate: toISODay(r.lastDate),
    }))
    .sort((a, b) => Number(b.openCount > 0) - Number(a.openCount > 0) || b.lastDate.localeCompare(a.lastDate));
}

export async function debtTotals() {
  await connectDB();
  const rows = await Debt.aggregate<{ _id: string; remaining: number; count: number }>([
    { $match: { settled: false } },
    { $group: { _id: "$direction", remaining: { $sum: { $subtract: ["$amount", "$paid"] } }, count: { $sum: 1 } } },
  ]);
  const find = (dir: string) => rows.find((r) => r._id === dir);
  return {
    owedToMe: round2(find("owed_to_me")?.remaining ?? 0),
    owedToMeCount: find("owed_to_me")?.count ?? 0,
    iOwe: round2(find("i_owe")?.remaining ?? 0),
    iOweCount: find("i_owe")?.count ?? 0,
  };
}

export async function debtActivity(from: string, to: string) {
  await connectDB();
  const range = rangeFilter(from, to);
  const [created, payments] = await Promise.all([
    Debt.aggregate<{ _id: string; sum: number; count: number }>([
      { $match: { date: range } },
      { $group: { _id: "$direction", sum: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Debt.aggregate<{ _id: string; sum: number }>([
      { $unwind: "$payments" },
      { $match: { "payments.date": range } },
      { $group: { _id: "$direction", sum: { $sum: "$payments.amount" } } },
    ]),
  ]);
  const pick = (rows: { _id: string; sum: number }[], dir: string) => round2(rows.find((r) => r._id === dir)?.sum ?? 0);
  return {
    lent: pick(created, "owed_to_me"),
    borrowed: pick(created, "i_owe"),
    received: pick(payments, "owed_to_me"),
    repaid: pick(payments, "i_owe"),
  };
}

export async function upcomingDebts(limit = 5) {
  await connectDB();
  const docs = await Debt.find({ settled: false, dueDate: { $ne: null } })
    .sort({ dueDate: 1 })
    .limit(limit)
    .lean<DebtDoc[]>();
  return docs.map(toDebtItem);
}

export async function personNames() {
  await connectDB();
  const rows = await Debt.aggregate<{ _id: string; person: string }>([
    { $sort: { date: -1 } },
    { $group: { _id: "$personKey", person: { $first: "$person" } } },
    { $sort: { person: 1 } },
  ]);
  return rows.map((r) => r.person);
}
