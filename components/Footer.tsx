import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-100 bg-slate-50/50 py-12 dark:border-slate-800 dark:bg-slate-900/30 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © {currentYear} 影視戴爾瑞. All rights reserved. Powered by Next.js & Notion.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-200">
              首頁
            </Link>
            <Link
              href="/sitemap.xml"
              target="_blank"
              className="hover:text-slate-900 dark:hover:text-slate-200"
            >
              網站地圖 (Sitemap)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
