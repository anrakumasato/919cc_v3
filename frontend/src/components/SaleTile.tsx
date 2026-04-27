import Link from "next/link"
import Image from "next/image"
import { SaleItem } from "@/types/sale"

type Props = {
  item: SaleItem
}

export default function SaleTile({ item }: Props) {
  const discountPct = Math.round(item.discountRate * 100)

  return (
    <Link href={`/items/${item.slug}`}>
      <article className="relative aspect-square overflow-hidden cursor-pointer group md:shadow-sm md:hover:shadow-lg md:transition-shadow bg-white">
        {/* 商品画像 */}
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* 割引バッジ */}
        <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
          -{discountPct}%
        </div>

        {/* 検出時刻 */}
        <div className="absolute top-2.5 left-2.5 text-white/60 text-xs">
          {item.detectedAt}
        </div>

        {/* 下部グラデーションオーバーレイ */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 space-y-1">
          <p className="text-white/60 text-xs font-medium">{item.brand}</p>
          <p className="text-white font-bold text-sm leading-tight line-clamp-1">{item.name}</p>
          <div className="flex items-center justify-between">
            <span className="text-white text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium">
              {item.anomalySize} のみ
            </span>
            <div className="text-right">
              <p className="text-white font-black text-sm leading-none">
                ¥{item.anomalyPrice.toLocaleString()}
              </p>
              <p className="text-white/50 text-xs line-through leading-none mt-0.5">
                ¥{item.standardPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
