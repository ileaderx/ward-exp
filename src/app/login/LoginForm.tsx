"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { login } from "@/lib/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-300">البريد الإلكتروني</span>
        <input name="email" type="email" defaultValue={state?.email} key={state?.email} autoComplete="email" inputMode="email" required className="field" placeholder="you@example.com" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-300">كلمة المرور</span>
        <div className="relative" dir="ltr">
          <input name="password" type={show ? "text" : "password"} autoComplete="current-password" required className="field pr-12" placeholder="••••••••" />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-400"
            aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3.5 text-base">
        {pending ? <Loader2 className="size-5 animate-spin" /> : <LogIn className="size-5" />}
        دخول
      </button>
    </form>
  );
}
