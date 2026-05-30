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
          className="text-sm font-bold text-white whitespace-nowrap px-4 py-1.5 rounded-full bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] hover:opacity-90 transition-opacity"
        >
          サイズから探す
        </Link>
      </div>
    </header>
  )
}
