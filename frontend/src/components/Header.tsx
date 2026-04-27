"use client"

import Link from "next/link"
import Image from "next/image"

export default function Header() {
  return (
    <header className="sticky top-0 bg-gray-900 z-40">
      <div className="max-w-9xl mx-auto px-3 md:px-4 py-2.5 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/main_icon.jpg"
            alt="919.cc"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <span className="text-white text-sm font-bold leading-tight">
            あなたのサイズの最安値、見つけます。
            <span className="text-gray-400 font-normal"> | 919.cc</span>
          </span>
        </Link>

        {/* サイズから探す */}
        <Link
          href="/size"
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap"
        >
          サイズから探す
        </Link>
      </div>
    </header>
  )
}
