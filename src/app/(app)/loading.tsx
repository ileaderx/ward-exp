// Shown the moment a tab or link is tapped, while the page loads its data.
export default function Loading() {
  const bar = "animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70";
  return (
    <div className="space-y-4 pt-6 pb-4 md:pt-10" aria-busy="true" aria-label="جاري التحميل">
      <div className="space-y-2 pb-1">
        <div className={`${bar} h-4 w-28 rounded-full`} />
        <div className={`${bar} h-8 w-44 rounded-full`} />
      </div>
      <div className={`${bar} h-36`} />
      <div className="grid grid-cols-2 gap-3">
        <div className={`${bar} h-24`} />
        <div className={`${bar} h-24`} />
      </div>
      <div className={`${bar} h-56`} />
      <div className={`${bar} h-40`} />
    </div>
  );
}
