import type { Metadata } from "next"
import { Geist } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import BottomNav from "@/components/BottomNav"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://919.cc"),
  title: {
    default: "スニーカー サイズ限定セール情報 | 919.cc",
    template: "%s | 919.cc",
  },
  description: "スニーカーのサイズ別セール情報をリアルタイムで検出。標準価格より15%以上安いサイズを自動検出して紹介します。",
  openGraph: {
    siteName: "919.cc",
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/main_icon.jpg", width: 512, height: 512, alt: "919.cc" }],
  },
  twitter: {
    card: "summary",
    site: "@919cc",
    images: ["/main_icon.jpg"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${geist.className} bg-gray-50 antialiased`}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-EM209FXQJY" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-EM209FXQJY');
        `}</Script>
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
