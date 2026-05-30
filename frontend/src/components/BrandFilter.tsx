"use client"

import { useState } from "react"
import SaleTile from "./SaleTile"
import { SaleItem } from "@/types/sale"

export default function BrandFilter({ items, hideSize = false }: { items: SaleItem[]; hideSize?: boolean }) {
  const [selectedSize, setSelectedSize]   = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [dialog, setDialog]               = useState<"size" | "brand" | null>(null)

  const sizes = [...new Set(items.map((i) => i.anomalySize))].sort(
    (a, b) => parseFloat(a) - parseFloat(b)
  )
  const brands = [...new Set(items.map((i) => i.brand))].sort()

  const filtered = items
    .filter((i) => !selectedSize  || i.anomalySize === selectedSize)
    .filter((i) => !selectedBrand || i.brand === selectedBrand)

  return (
    <>
      {/* フィルターボタン */}
      <div className="flex gap-2 px-2 md:px-2 py-2">
        {!hideSize && <button
          onClick={() => setDialog("size")}
          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
            selectedSize
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          {selectedSize ? `${selectedSize}` : "サイズから絞る"}
          {selectedSize && (
            <span
              onClick={(e) => { e.stopPropagation(); setSelectedSize(null) }}
              className="ml-0.5 text-white/70 hover:text-white"
            >×</span>
          )}
        </button>}

        <button
          onClick={() => setDialog("brand")}
          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
            selectedBrand
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          {selectedBrand ? `${selectedBrand}` : "ブランドから絞る"}
          {selectedBrand && (
            <span
              onClick={(e) => { e.stopPropagation(); setSelectedBrand(null) }}
              className="ml-0.5 text-white/70 hover:text-white"
            >×</span>
          )}
        </button>
      </div>

      {/* ダイアログ */}
      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40"
          onClick={() => setDialog(null)}
        >
          <div
            className="w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl p-5 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-gray-900">
                {dialog === "size" ? "サイズを選ぶ" : "ブランドを選ぶ"}
              </h2>
              <button onClick={() => setDialog(null)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
            </div>

            <div className="flex flex-wrap gap-2 overflow-y-auto">
              <button
                onClick={() => { if (dialog === "size") setSelectedSize(null); else setSelectedBrand(null); setDialog(null) }}
                className="text-sm font-medium px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                すべて
              </button>
              {(dialog === "size" ? sizes : brands).map((val) => {
                const isActive = dialog === "size" ? selectedSize === val : selectedBrand === val
                return (
                  <button
                    key={val}
                    onClick={() => {
                      if (dialog === "size") setSelectedSize(val); else setSelectedBrand(val)
                      setDialog(null)
                    }}
                    className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${
                      isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {val}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* グリッド */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0.5 md:gap-2">
        {filtered.map((item) => (
          <SaleTile key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}
