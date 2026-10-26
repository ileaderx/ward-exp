import { addDays, addMonths, isISODay, monthEnd, monthStart, todayISO } from "@/lib/dates";

export const PRESETS = [
  { id: "this-month", label: "هذا الشهر" },
  { id: "last-month", label: "الشهر الماضي" },
  { id: "30d", label: "آخر 30 يوم" },
  { id: "3m", label: "3 أشهر" },
  { id: "this-year", label: "هذه السنة" },
] as const;

export type PresetId = (typeof PRESETS)[number]["id"] | "custom";

export function resolveRange(sp: { range?: unknown; from?: unknown; to?: unknown }) {
  const today = todayISO();
  if (isISODay(sp.from) && isISODay(sp.to)) {
    const [from, to] = sp.from <= sp.to ? [sp.from, sp.to] : [sp.to, sp.from];
    return { id: "custom" as PresetId, from, to };
  }
  switch (sp.range) {
    case "last-month": {
      const m = addMonths(today, -1);
      return { id: "last-month" as PresetId, from: m, to: monthEnd(m) };
    }
    case "30d":
      return { id: "30d" as PresetId, from: addDays(today, -29), to: today };
    case "3m":
      return { id: "3m" as PresetId, from: addMonths(today, -2), to: today };
    case "this-year":
      return { id: "this-year" as PresetId, from: `${today.slice(0, 4)}-01-01`, to: today };
    default:
      return { id: "this-month" as PresetId, from: monthStart(today), to: today };
  }
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1;
}
