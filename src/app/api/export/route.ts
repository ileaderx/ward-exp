import { getSession } from "@/lib/auth";
import { listDebts, listExpenses } from "@/lib/data";
import { isISODay, todayISO } from "@/lib/dates";

function csvCell(value: string | number | null) {
  const s = value === null ? "" : String(value);
  // Leading =,+,-,@ would run as a formula in Excel.
  const safe = /^[=+\-@]/.test(s) && typeof value === "string" ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function csv(rows: (string | number | null)[][]) {
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export async function GET(req: Request) {
  if (!(await getSession())) return new Response("غير مصرح", { status: 401 });

  const url = new URL(req.url);
  const today = todayISO();
  const from = isISODay(url.searchParams.get("from")) ? url.searchParams.get("from")! : `${today.slice(0, 7)}-01`;
  const to = isISODay(url.searchParams.get("to")) ? url.searchParams.get("to")! : today;

  const [expenses, debts] = await Promise.all([listExpenses({ from, to }), listDebts({ status: "all" })]);

  const body = [
    csv([["المصاريف", `${from} إلى ${to}`], ["التاريخ", "الفئة", "ملاحظة", "المبلغ"], ...expenses.map((e) => [e.date, e.category, e.note, e.amount])]),
    csv([
      ["الديون", "الكل"],
      ["التاريخ", "الشخص", "النوع", "المبلغ", "المدفوع", "المتبقي", "تاريخ السداد", "الحالة", "ملاحظة"],
      ...debts.map((d) => [
        d.date,
        d.person,
        d.direction === "owed_to_me" ? "لي عنده" : "علي له",
        d.amount,
        d.paid,
        d.remaining,
        d.dueDate,
        d.settled ? "مسدد" : "مفتوح",
        d.note,
      ]),
    ]),
  ].join("\r\n\r\n");

  // BOM so Excel opens UTF-8 (Arabic names) correctly.
  return new Response("﻿" + body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="expenses-${from}-to-${to}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
