import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200/80 bg-white py-10 dark:border-slate-800 dark:bg-slate-950 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* 導航連結置中 */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400">
            首頁
          </Link>
          <Link href="/about" className="hover:text-amber-600 dark:hover:text-amber-400">
            關於我們
          </Link>
          <Link href="/contact" className="hover:text-amber-600 dark:hover:text-amber-400">
            聯絡我們
          </Link>
          <Link href="/privacy" className="hover:text-amber-600 dark:hover:text-amber-400">
            隱私權政策 (Privacy)
          </Link>
        </div>

        {/* 底部版權置中 */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-400 dark:text-slate-500">
          © {currentYear} 影視戴爾瑞. All rights reserved. 內容均為原創評論，未經授權禁止轉載。
        </div>
      </div>
    </footer>
  );
}