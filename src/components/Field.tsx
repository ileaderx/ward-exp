export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300">
      {children}
      {hint && <span className="text-xs font-normal text-zinc-400">{hint}</span>}
    </span>
  );
}

export function AmountInput({ defaultValue, autoFocus, max }: { defaultValue?: number; autoFocus?: boolean; max?: number }) {
  return (
    <input
      name="amount"
      type="number"
      inputMode="decimal"
      step="0.01"
      min="0.01"
      max={max}
      required
      autoFocus={autoFocus}
      defaultValue={defaultValue}
      placeholder="0.00"
      className="field tabular py-4 text-center !text-3xl font-bold tracking-tight"
    />
  );
}
