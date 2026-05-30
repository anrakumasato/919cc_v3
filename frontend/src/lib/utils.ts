import { SaleItem } from "@/types/sale"

export function dedupeByProduct(items: SaleItem[]): SaleItem[] {
  const map = new Map<string, SaleItem>()
  for (const item of items) {
    const existing = map.get(item.slug)
    if (!existing || item.discountRate > existing.discountRate) {
      map.set(item.slug, item)
    }
  }
  return Array.from(map.values())
}
