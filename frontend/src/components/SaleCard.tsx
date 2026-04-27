import { SaleItem } from "@/types/sale"

type Props = {
  item: SaleItem
}

export default function SaleCard({ item }: Props) {
  const discountPct = Math.round(item.discountRate * 100)

  return (
    <article className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* 画像エリア（プレースホルダー） */}
      <div className="relative aspect-square w-full flex items-center justify-center"
        style={{ backgroundColor: item.brandColor }}>
        <span className="text-white text-4xl font-black tracking-tight opacity-20 select-none">
          {item.brand.toUpperCase()}
        </span>
        {/* 割引バッジ */}
        <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-full">
          -{discountPct}%
        </div>
        {/* サイズバッジ */}
        <div className="absolute bottom-3 left-3 bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">
          {item.anomalySize} のみ
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-4 space-y-3">
        {/* ブランド・時刻 */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {item.brand}
          </span>
          <span className="text-xs text-gray-400">{item.detectedAt}</span>
        </div>

        {/* 商品名 */}
        <h2 className="font-bold text-gray-900 text-base leading-snug">
          {item.name}
        </h2>

        {/* 価格 */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-red-500">
            ¥{item.anomalyPrice.toLocaleString()}
          </span>
          <span className="text-sm text-gray-400 line-through">
            ¥{item.standardPrice.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-red-500">
            (-¥{item.discountAmount.toLocaleString()})
          </span>
        </div>

        {/* Amazonボタン */}
        <a
          href={item.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold py-3 rounded-xl text-sm transition-colors"
        >
          Amazonで見る →
        </a>
      </div>
    </article>
  )
}
