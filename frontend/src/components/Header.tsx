"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/search", label: "検索" },
  { href: "/small-size", label: "小さいサイズ" },
  { href: "/large-size", label: "大きいサイズ" },
]

export default function Header({ totalCount }: { totalCount: number }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 bg-white border-b border-gray-100 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="text-xl font-black tracking-tight text-gray-900">
          919<span className="text-red-500">.band</span>
        </Link>

        {/* PC ナビ */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 検出件数バッジ */}
        <span className="text-xs bg-red-50 text-red-500 font-semibold px-2.5 py-1 rounded-full">
          {totalCount}件 検出中
        </span>
      </div>
    </header>
  )
}
