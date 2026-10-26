export const EXPENSE_CATEGORIES = [
  { name: "طعام", emoji: "🍔" },
  { name: "بقالة", emoji: "🛒" },
  { name: "مواصلات", emoji: "🚗" },
  { name: "بنزين", emoji: "⛽" },
  { name: "فواتير", emoji: "💡" },
  { name: "إيجار", emoji: "🏠" },
  { name: "تسوق", emoji: "🛍️" },
  { name: "صحة", emoji: "💊" },
  { name: "ترفيه", emoji: "🎬" },
  { name: "تعليم", emoji: "📚" },
  { name: "عائلة", emoji: "👨‍👩‍👧" },
  { name: "أخرى", emoji: "📦" },
] as const;

export function categoryEmoji(name: string) {
  return EXPENSE_CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase())?.emoji ?? "🏷️";
}
