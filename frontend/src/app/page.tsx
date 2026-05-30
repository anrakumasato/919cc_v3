import type { Metadata } from "next"
import Header from "@/components/Header"
import BrandFilter from "@/components/BrandFilter"
import { getSaleItems } from "@/lib/api"
import { dedupeByProduct } from "@/lib/utils"

export const revalidate = 60

export const metadata: Metadata = {
  title: "スニーカー サイズ限定セール情報 | 919.cc",
  description: "スニーカーのサイズ別セール情報をリアルタイムで検出。標準価格より15%以上安いサイズを自動検出して紹介します。",
  openGraph: {
    title: "スニーカー サイズ限定セール情報 | 919.cc",
    description: "スニーカーのサイズ別セール情報をリアルタイムで検出。標準価格より15%以上安いサイズを自動検出して紹介します。",
  },
}

export default async function HomePage() {
  const items = dedupeByProduct(await getSaleItems())

  return (
    <>
      <Header />
      <main className="max-w-9xl mx-auto px-0 md:px-2 pb-18 md:pb-8 pt-0.5 md:pt-2">
        <BrandFilter items={items} />
      </main>
    </>
  )
}
