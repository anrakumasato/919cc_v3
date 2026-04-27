import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import BottomNav from "@/components/BottomNav"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "919.band — サイズ限定セール検出",
  description: "スニーカーのサイズ別セール情報をリアルタイムで検出・紹介",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${geist.className} bg-gray-50 antialiased`}>
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
