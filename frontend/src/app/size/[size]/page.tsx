import Link from "next/link"
import type { Metadata } from "next"
import Header from "@/components/Header"
import BrandFilter from "@/components/BrandFilter"
import { mockSaleItems } from "@/data/mock"
import { sizeToSlug, slugToSize } from "@/lib/size"

type Props = { params: Promise<{ size: string }> }

export async function generateStaticParams() {
  const sizes = [...new Set(mockSaleItems.map((item) => item.anomalySize))]
  return sizes.map((size) => ({ size: sizeToSlug(size) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { size: sizeSlug } = await params
  const size = slugToSize(sizeSlug)
  return {
    title: `${size} スニーカー 最安値 | 919.band`,
    description: `${size}のサイズ限定セールスニーカー一覧。標準価格より15%以上安いサイズを自動検出。`,
  }
}

export default async function SizeDetailPage({ params }: Props) {
  const { size: sizeSlug } = await params
  const size = slugToSize(sizeSlug)
  const items = mockSaleItems.filter((item) => item.anomalySize === size)

  return (
    <>
      <Header />
      <main className="max-w-9xl mx-auto px-0 md:px-2 pb-18 md:pb-8">
        <div className="px-4 md:px-0 pt-4 pb-1 flex items-center gap-3">
          <Link href="/size" className="text-gray-400 hover:text-gray-700 text-sm transition-colors">
            ← サイズ一覧
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-black text-gray-900">{size} スニーカー 最安値</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">現在 {size} のセール情報はありません</p>
          </div>
        ) : (
          <BrandFilter items={items} />
        )}
      </main>
    </>
  )
}
