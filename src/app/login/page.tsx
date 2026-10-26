import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { AppIconArt } from "@/components/AppIcon";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <main className="pt-safe flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 size-16 overflow-hidden rounded-2xl shadow-lg shadow-brand-600/30">
            <AppIconArt size={64} rounded />
          </div>
          <h1 className="text-2xl font-bold">أهلاً بعودتك</h1>
          <p className="mt-1 text-sm text-zinc-500">سجّل دخولك لمتابعة مصاريفك وديونك</p>
        </div>
        <div className="card p-6">
          <LoginForm next={typeof next === "string" ? next : ""} />
        </div>
      </div>
    </main>
  );
}
