import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          {/* Logo 圖片 */}
          <div className="relative h-9 w-9 overflow-hidden rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 group-hover:ring-2 group-hover:ring-amber-500 transition-all">
            <Image
              src="/logo.jpg"
              alt="影視戴爾瑞 Logo"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
            影視戴爾瑞
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link
            href="/"
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            首頁
          </Link>
          <Link
            href="/sitemap.xml"
            target="_blank"
            className="hidden sm:inline hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            Sitemap
          </Link>
        </nav>
      </div>
    </header>
  );
}
