"use client";

import { useEffect } from "react";
import { RotateCw, Stethoscope } from "lucide-react";

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70dvh] items-center justify-center">
      <div className="card w-full max-w-sm p-6 text-center">
        <div className="mb-3 text-5xl">⚠️</div>
        <h1 className="text-lg font-bold">صار خطأ أثناء تحميل الصفحة</h1>
        <p className="mt-1 text-sm text-zinc-500">غالباً مشكلة في الاتصال بقاعدة البيانات. جرّب مرة ثانية، أو افحص الاتصال لتعرف السبب.</p>
        <div className="mt-5 flex flex-col gap-2">
          <button onClick={() => retry()} className="btn-primary">
            <RotateCw className="size-4" />
            حاول مرة ثانية
          </button>
          <a href="/api/health" className="btn-ghost">
            <Stethoscope className="size-4" />
            فحص الاتصال
          </a>
        </div>
      </div>
    </div>
  );
}
