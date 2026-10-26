import mongoose from "mongoose";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Expense from "@/models/Expense";
import Debt from "@/models/Debt";

function hint(err: unknown) {
  const e = err as { name?: string; code?: number; codeName?: string; message?: string };
  const msg = e.message ?? "";
  if (msg.includes("MONGODB_URI is not set")) return "المتغير MONGODB_URI غير موجود في إعدادات الاستضافة.";
  if (e.name === "MongoParseError" || /Invalid scheme|unescaped|URI must/i.test(msg)) return "صيغة رابط MONGODB_URI غير صحيحة. إذا كلمة السر فيها رموز مثل # أو @ لازم تتشفّر (# ← %23 ، @ ← %40).";
  if (e.code === 8000 || e.codeName === "AtlasError" || /bad auth|authentication failed/i.test(msg))
    return "اسم المستخدم أو كلمة السر في MONGODB_URI غلط.";
  if (e.code === 13 || /not authorized|not allowed/i.test(msg))
    return "مستخدم قاعدة البيانات ما عنده صلاحية على قاعدة ward-exp. من Atlas ← Database Access أعطه صلاحية readWrite على ward-exp أو Read and write to any database.";
  if (e.name === "MongoServerSelectionError" || /ENOTFOUND|ECONNREFUSED|timed out|querySrv/i.test(msg))
    return "ما قدر يوصل للسيرفر. تأكد من Network Access في Atlas (0.0.0.0/0) ومن اسم الـ Cluster في الرابط.";
  return "خطأ غير معروف، ابعت الرسالة كاملة.";
}

// Lets the signed-in owner see why the database connection fails, without exposing secrets.
export async function GET() {
  if (!(await getSession())) return Response.json({ ok: false, error: "سجّل الدخول أولاً" }, { status: 401 });
  const env = {
    MONGODB_URI: Boolean(process.env.MONGODB_URI),
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
    ADMIN_EMAIL: Boolean(process.env.ADMIN_EMAIL),
    ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
  };
  try {
    await connectDB();
    const [expenses, debts] = await Promise.all([Expense.countDocuments(), Debt.countDocuments()]);
    return Response.json({ ok: true, database: mongoose.connection.name, expenses, debts, env });
  } catch (err) {
    const e = err as { name?: string; code?: number; message?: string };
    const message = (e.message ?? String(err)).replace(/mongodb(\+srv)?:\/\/\S+/g, "mongodb://***");
    return Response.json({ ok: false, hint: hint(err), error: { name: e.name, code: e.code, message }, env }, { status: 500 });
  }
}
