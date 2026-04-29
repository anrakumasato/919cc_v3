import { SaleItem } from "@/types/sale"

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:8000"

export async function getSaleItems(size?: string): Promise<SaleItem[]> {
  const url = new URL(`${API_BASE}/api/sales`)
  if (size) url.searchParams.set("size", size)
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getSizes(): Promise<{ size: string; count: number }[]> {
  try {
    const res = await fetch(`${API_BASE}/api/sizes`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
