export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "USD";

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY, maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY, notation: "compact", maximumFractionDigits: 1 });

export function money(value: number) {
  return formatter.format(value);
}

export function moneyCompact(value: number) {
  return Math.abs(value) >= 10000 ? compact.format(value) : formatter.format(value);
}

// Keeps sums of decimal amounts from drifting (0.1 + 0.2).
export function round2(value: number) {
  return Math.round(value * 100) / 100;
}
