"use client"

import { useState } from "react"
import SaleTile from "./SaleTile"
import { SaleItem } from "@/types/sale"

export default function BrandFilter({ items }: { items: SaleItem[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const brands = [...new Set(items.map((i) => i.brand))].sort()
  const filtered = selected ? items.filter((i) => i.brand === selected) : items

  return (
    <>
      {/* ブランドフィルター */}
      <div className="flex gap-2 overflow-x-auto px-0 md:px-2 py-2 scrollbar-hide">
        <button
          onClick={() => setSelected(null)}
          className={`flex-none text-sm font-medium px-4 py-1.5 rounded-full transition-colors whitespace-nowrap ${
            !selected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          すべて
        </button>
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => setSelected(selected === brand ? null : brand)}
            className={`flex-none text-sm font-medium px-4 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              selected === brand ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* グリッド */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0.5 md:gap-2">
        {filtered.map((item) => (
          <SaleTile key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}
