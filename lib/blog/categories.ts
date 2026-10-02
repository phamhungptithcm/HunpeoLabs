// Public labels and legacy aliases. Stored editorial metadata remains untouched.
const groups: Record<string, readonly string[]> = {
  "AI & Automation": ["AI & Automation", "AI & Tự động hóa", "AI Engineering in Practice"],
  Engineering: ["Engineering", "Kỹ thuật"],
  Product: ["Product", "Sản phẩm"],
  Design: ["Design", "Thiết kế"],
};
export function categoryLabel(value: string): string {
  return Object.entries(groups).find(([, aliases]) => aliases.includes(value))?.[0] ?? value;
}
export function categoryAliases(value: string): string[] {
  return [...(groups[categoryLabel(value)] ?? [value])];
}
