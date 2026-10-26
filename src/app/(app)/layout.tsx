import { requireSession } from "@/lib/auth";
import { BottomTabs, Sidebar } from "@/components/Nav";
import { Toaster } from "@/components/Toast";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return (
    <Toaster>
      <Sidebar />
      <div className="md:pl-64">
        <main className="pt-safe mx-auto max-w-5xl px-4 pb-32 sm:px-6 md:pb-12">{children}</main>
      </div>
      <BottomTabs />
    </Toaster>
  );
}
