export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "KWD";

// Arabic labels (د.ك) with Western digits, which read better for amounts.
export const LOCALE = "ar-KW-u-nu-latn";

const formatter = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY });
const compact = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY, notation: "compact", maximumFractionDigits: 1 });

export function money(value: number) {
  return formatter.format(value);
}

export function moneyCompact(value: number) {
  return Math.abs(value) >= 10000 ? compact.format(value) : formatter.format(value);
}

// Keeps sums of decimal amounts from drifting (0.1 + 0.2). Three decimals
// covers currencies with fils, like KWD.
export function roundMoney(value: number) {
  return Math.round(value * 1000) / 1000;
}
