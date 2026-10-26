import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-3 pt-6 pb-5 md:pt-10">
      <div className="min-w-0">
        {subtitle && <p className="text-sm font-medium text-zinc-500">{subtitle}</p>}
        <h1 className="truncate text-[28px] leading-tight font-bold tracking-tight">{title}</h1>
      </div>
      <div className="no-print flex shrink-0 items-center gap-2">
        {action}
        <form action={logout} className="md:hidden">
          <button className="flex size-10 items-center justify-center rounded-full bg-white text-zinc-500 ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10" aria-label="Sign out">
            <LogOut className="size-[18px]" />
          </button>
        </form>
      </div>
    </header>
  );
}
