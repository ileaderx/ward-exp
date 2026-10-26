// Dates are stored as UTC midnight of the calendar day the user picked, so a
// "YYYY-MM-DD" string round-trips without time-zone drift.

export const TIME_ZONE = process.env.APP_TIMEZONE || "Asia/Kuwait";

export function todayISO(timeZone = TIME_ZONE) {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function parseDay(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function toISODay(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number) {
  const d = parseDay(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODay(d);
}

export function monthStart(iso: string) {
  return `${iso.slice(0, 7)}-01`;
}

export function monthEnd(iso: string) {
  const d = parseDay(monthStart(iso));
  d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(0);
  return toISODay(d);
}

export function addMonths(iso: string, months: number) {
  const d = parseDay(monthStart(iso));
  d.setUTCMonth(d.getUTCMonth() + months);
  return toISODay(d);
}

export function isISODay(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseDay(value).getTime());
}

export function formatDay(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(parseDay(iso));
}

export function formatMonth(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(parseDay(iso));
}

export function relativeDayLabel(iso: string, today = todayISO()) {
  if (iso === today) return "Today";
  if (iso === addDays(today, -1)) return "Yesterday";
  return formatDay(iso, { weekday: "short", day: "numeric", month: "short", year: iso.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric" });
}
