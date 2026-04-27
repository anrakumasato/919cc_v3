import Link from "next/link"
import type { Metadata } from "next"
import Header from "@/components/Header"
import { mockSaleItems } from "@/data/mock"
import { sizeToSlug } from "@/lib/size"

export const metadata: Metadata = {
  title: "サイズ別 スニーカー 最安値 | 919.band",
  description: "サイズ別のスニーカーセール情報。あなたのサイズの最安値を今すぐチェック。",
}

export default function SizePage() {
  const sizes = [...new Set(mockSaleItems.map((i) => i.anomalySize))].sort(
    (a, b) => parseFloat(a) - parseFloat(b)
  )

  return (
    <>
      <Header totalCount={mockSaleItems.length} />
      <main className="pb-20 md:pb-8 max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <h1 className="text-lg font-black text-gray-900 mb-6">サイズから探す</h1>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sizes.map((size) => {
            const count = mockSaleItems.filter((i) => i.anomalySize === size).length
            return (
              <Link
                key={size}
                href={`/size/${sizeToSlug(size)}`}
                className="flex flex-col items-center justify-center aspect-square bg-white border border-gray-100 rounded-2xl hover:border-gray-900 hover:shadow-md transition-all group"
              >
                <span className="font-black text-gray-900 text-base group-hover:scale-105 transition-transform">
                  {size}
                </span>
                <span className="text-xs text-gray-400 mt-1">{count}件</span>
              </Link>
            )
          })}
        </div>
      </main>
    </>
  )
}
