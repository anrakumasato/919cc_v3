import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Header from "@/components/Header"
import { getItem } from "@/lib/api"
import { SizeEntry } from "@/types/sale"

export const revalidate = 60
export const dynamicParams = true

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getItem(Number(id))
  if (!data) return {}
  return {
    title: `${data.product.name} ${data.featured.size} 最安値 | 919.cc`,
    description: `${data.product.name} ${data.featured.size} が¥${data.featured.price.toLocaleString()}。標準価格¥${data.featured.standardPrice.toLocaleString()}より${Math.round((data.featured.discountRate ?? 0) * 100)}%オフ。`,
  }
}

export default async function ItemPage({ params }: Props) {
  const { id } = await params
  const data = await getItem(Number(id))
  if (!data) notFound()

  const { featured, product, sizes } = data

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 pb-24 md:pb-8">

        {/* パンくず */}
        <div className="pt-4 pb-2 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-700 transition-colors">ホーム</Link>
          <span>/</span>
          <span className="text-gray-700">{product.name}</span>
        </div>

        {/* FV */}
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm mb-6">
          {product.imageUrl && (
            <div className="relative w-full aspect-square">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            </div>
          )}

          {/* 割引バッジ */}
          {featured.isAnomaly && featured.discountRate && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-black px-3 py-1 rounded-full shadow-lg">
              -{Math.round(featured.discountRate * 100)}%
            </div>
          )}

          <div className="p-5 space-y-3">
            <p className="text-sm text-gray-400 font-medium">{product.brand}</p>
            <h1 className="text-xl font-black text-gray-900 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold bg-gray-900 text-white px-3 py-1 rounded-full">
                {featured.size}
              </span>
              {featured.isAnomaly && (
                <span className="text-xs text-red-500 font-bold">サイズ限定セール</span>
              )}
            </div>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-gray-900">
                ¥{featured.price.toLocaleString()}
              </span>
              <span className="text-base text-gray-400 line-through mb-0.5">
                ¥{featured.standardPrice.toLocaleString()}
              </span>
            </div>

            <a
              href={featured.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black py-3 rounded-xl transition-colors text-sm"
            >
              Amazonで購入する →
            </a>
          </div>
        </div>

        {/* サイズ別価格リスト */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-black text-gray-900">全サイズの価格</h2>
          </div>
          <ul>
            {sizes.map((entry: SizeEntry) => (
              <li
                key={entry.id}
                className={`flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0 ${
                  entry.id === featured.id ? "bg-red-50" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${entry.isAnomaly ? "text-red-600" : "text-gray-700"}`}>
                    {entry.size}
                  </span>
                  {entry.isAnomaly && (
                    <span className="text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">
                      -{Math.round((entry.discountRate ?? 0) * 100)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-black text-sm ${entry.isAnomaly ? "text-red-600" : "text-gray-900"}`}>
                    ¥{entry.price.toLocaleString()}
                  </span>
                  <a
                    href={entry.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors"
                  >
                    Amazon
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </main>
    </>
  )
}
