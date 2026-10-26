import { Plus } from "lucide-react";

// Floating on phones (pinned to the content area, above the tab bar), inline in the header on larger screens.
export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <>
      <button onClick={onClick} className="btn-primary hidden md:inline-flex">
        <Plus className="size-5" />
        {label}
      </button>
      <button
        onClick={onClick}
        aria-label={label}
        className="no-print absolute end-5 bottom-5 z-40 flex size-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/40 transition active:scale-95 md:hidden"
      >
        <Plus className="size-7" strokeWidth={2.5} />
      </button>
    </>
  );
}
