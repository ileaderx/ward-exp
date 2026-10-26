"use server";

import { timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { isISODay, parseDay } from "@/lib/dates";
import { money, roundMoney } from "@/lib/format";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";
import type { ActionResult } from "@/lib/types";
import Expense from "@/models/Expense";
import Debt, { DEBT_DIRECTIONS } from "@/models/Debt";
import { personKey } from "@/lib/people";

/* ---------- auth ---------- */

function sameText(a: string, b: string) {
  // Hashing first gives equal-length buffers, which timingSafeEqual requires.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function login(_prev: { error?: string; email?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!adminEmail || !adminPassword) {
    return { error: "تسجيل الدخول غير مُعد. أضف ADMIN_EMAIL و ADMIN_PASSWORD.", email };
  }

  const ok = sameText(email, adminEmail) && sameText(password, adminPassword);
  if (!ok) {
    // Slows down password guessing.
    await new Promise((r) => setTimeout(r, 800));
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", email };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(adminEmail), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

/* ---------- helpers ---------- */

const amountField = z.coerce
  .number({ error: "أدخل المبلغ" })
  .refine((n) => Number.isFinite(n) && n > 0, "المبلغ لازم يكون أكبر من صفر")
  .refine((n) => n < 1e12, "المبلغ كبير جداً")
  .transform(roundMoney);

const dayField = z.string().refine(isISODay, "اختر تاريخاً صحيحاً");
const noteField = z.string().trim().max(200, "الملاحظة طويلة جداً").default("");

function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "تأكد من البيانات المدخلة";
}

function refreshAll() {
  revalidatePath("/", "layout");
}

async function guard<T>(fn: () => Promise<T>): Promise<T | ActionResult> {
  await requireSession();
  try {
    await connectDB();
    return await fn();
  } catch (err) {
    console.error(err);
    return { ok: false, error: "صار خطأ، حاول مرة ثانية." };
  }
}

/* ---------- expenses ---------- */

const expenseSchema = z.object({
  id: z.string().optional(),
  amount: amountField,
  category: z.string().trim().min(1, "اختر الفئة").max(40, "اسم الفئة طويل جداً"),
  note: noteField,
  date: dayField,
});

export async function saveExpense(formData: FormData): Promise<ActionResult> {
  return guard(async () => {
    const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
    const { id, date, ...rest } = parsed.data;
    const values = { ...rest, date: parseDay(date) };

    if (id) {
      if (!isValidObjectId(id)) return { ok: false, error: "المصروف غير موجود" };
      const updated = await Expense.findByIdAndUpdate(id, values);
      if (!updated) return { ok: false, error: "المصروف غير موجود" };
    } else {
      await Expense.create(values);
    }
    refreshAll();
    return { ok: true, message: id ? "تم تعديل المصروف" : "تمت إضافة المصروف" };
  });
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  return guard(async () => {
    if (!isValidObjectId(id)) return { ok: false, error: "المصروف غير موجود" };
    await Expense.findByIdAndDelete(id);
    refreshAll();
    return { ok: true, message: "تم حذف المصروف" };
  });
}

/* ---------- debts ---------- */

const debtSchema = z.object({
  id: z.string().optional(),
  person: z.string().trim().min(1, "اكتب اسم الشخص").max(60, "الاسم طويل جداً"),
  direction: z.enum(DEBT_DIRECTIONS, { error: "اختر: لي عنده أو علي له" }),
  amount: amountField,
  note: noteField,
  date: dayField,
  dueDate: z.union([z.literal(""), dayField]).default(""),
});

export async function saveDebt(formData: FormData): Promise<ActionResult> {
  return guard(async () => {
    const parsed = debtSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
    const { id, person, date, dueDate, ...rest } = parsed.data;
    const cleanName = person.replace(/\s+/g, " ");
    const values = {
      ...rest,
      person: cleanName,
      personKey: personKey(cleanName),
      date: parseDay(date),
      dueDate: dueDate ? parseDay(dueDate) : null,
    };

    if (id) {
      if (!isValidObjectId(id)) return { ok: false, error: "الدين غير موجود" };
      const debt = await Debt.findById(id);
      if (!debt) return { ok: false, error: "الدين غير موجود" };
      if (values.amount < debt.paid) {
        return { ok: false, error: `المبلغ لا يمكن أن يكون أقل من المدفوع (${money(debt.paid)})` };
      }
      debt.set(values);
      debt.settled = roundMoney(debt.amount - debt.paid) <= 0;
      await debt.save();
    } else {
      await Debt.create(values);
    }
    refreshAll();
    return { ok: true, message: id ? "تم تعديل الدين" : "تمت إضافة الدين" };
  });
}

export async function deleteDebt(id: string): Promise<ActionResult> {
  return guard(async () => {
    if (!isValidObjectId(id)) return { ok: false, error: "الدين غير موجود" };
    await Debt.findByIdAndDelete(id);
    refreshAll();
    return { ok: true, message: "تم حذف الدين" };
  });
}

const paymentSchema = z.object({
  debtId: z.string().refine(isValidObjectId, "الدين غير موجود"),
  amount: amountField,
  date: dayField,
  note: noteField,
});

export async function addPayment(formData: FormData): Promise<ActionResult> {
  return guard(async () => {
    const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
    const { debtId, amount, date, note } = parsed.data;

    const debt = await Debt.findById(debtId);
    if (!debt) return { ok: false, error: "الدين غير موجود" };
    const remaining = roundMoney(debt.amount - debt.paid);
    if (remaining <= 0) return { ok: false, error: "هذا الدين مسدد بالكامل" };
    if (amount > remaining) return { ok: false, error: `الدفعة أكبر من المتبقي (${money(remaining)})` };

    debt.payments.push({ amount, date: parseDay(date), note });
    debt.paid = roundMoney(debt.paid + amount);
    debt.settled = roundMoney(debt.amount - debt.paid) <= 0;
    await debt.save();
    refreshAll();
    return { ok: true, message: debt.settled ? "تم السداد بالكامل 🎉" : "تم تسجيل الدفعة" };
  });
}

export async function deletePayment(debtId: string, paymentId: string): Promise<ActionResult> {
  return guard(async () => {
    if (!isValidObjectId(debtId)) return { ok: false, error: "الدين غير موجود" };
    const debt = await Debt.findById(debtId);
    const payment = debt?.payments.id(paymentId);
    if (!debt || !payment) return { ok: false, error: "الدفعة غير موجودة" };
    debt.paid = roundMoney(Math.max(0, debt.paid - payment.amount));
    payment.deleteOne();
    debt.settled = roundMoney(debt.amount - debt.paid) <= 0;
    await debt.save();
    refreshAll();
    return { ok: true, message: "تم حذف الدفعة" };
  });
}
