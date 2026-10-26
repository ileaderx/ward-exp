"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BarChart3, HandCoins, LayoutDashboard, LogOut, Wallet } from "lucide-react";
import { logout } from "@/lib/actions";
import { AppIconArt } from "@/components/AppIcon";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/debts", label: "Debts", icon: HandCoins },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="no-print fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-black/5 bg-white/70 px-4 py-6 backdrop-blur md:flex dark:border-white/10 dark:bg-zinc-950/70">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="size-9 overflow-hidden rounded-xl">
          <AppIconArt size={36} rounded />
        </div>
        <span className="text-lg font-bold tracking-tight">Ward Expenses</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
              )}
            >
              <Icon className="size-5" />
              {label === "Home" ? "Dashboard" : label}
            </Link>
          );
        })}
      </nav>
      <form action={logout}>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
          <LogOut className="size-5" />
          Sign out
        </button>
      </form>
    </aside>
  );
}

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav className="no-print pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/85 backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-zinc-950/85">
      <div className="grid grid-cols-4">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] font-medium transition",
                active ? "text-brand-600 dark:text-brand-500" : "text-zinc-400",
              )}
            >
              <Icon className="size-6" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
