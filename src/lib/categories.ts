export const EXPENSE_CATEGORIES = [
  { name: "Food", emoji: "🍔" },
  { name: "Groceries", emoji: "🛒" },
  { name: "Transport", emoji: "🚗" },
  { name: "Fuel", emoji: "⛽" },
  { name: "Bills", emoji: "💡" },
  { name: "Rent", emoji: "🏠" },
  { name: "Shopping", emoji: "🛍️" },
  { name: "Health", emoji: "💊" },
  { name: "Entertainment", emoji: "🎬" },
  { name: "Education", emoji: "📚" },
  { name: "Family", emoji: "👨‍👩‍👧" },
  { name: "Other", emoji: "📦" },
] as const;

export function categoryEmoji(name: string) {
  return EXPENSE_CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase())?.emoji ?? "🏷️";
}
