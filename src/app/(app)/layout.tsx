import { requireSession } from "@/lib/auth";
import { BottomTabs, Sidebar } from "@/components/Nav";
import { Toaster } from "@/components/Toast";
import { Scroller } from "@/components/Scroller";

// App shell: the screen never scrolls, only the content area does. iOS Safari
// misplaces position:fixed bars (mid-screen tab bar after the keyboard closes,
// content under the status bar), so the tab bar here is a normal flex child.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return (
    <Toaster>
      <div className="app-shell pt-safe flex h-dvh flex-col overflow-hidden md:flex-row md:pt-0">
        <Sidebar />
        <div className="relative min-h-0 flex-1">
          <Scroller>
            <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 md:pb-12">{children}</main>
          </Scroller>
        </div>
        <BottomTabs />
      </div>
    </Toaster>
  );
}
