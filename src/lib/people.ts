// Lower-cased, single-spaced name groups "Ali" and "ali " under one person.
export function personKey(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}
