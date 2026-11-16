"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Clapperboard, Menu, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 點擊選單外部時自動收合
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "關於我們", href: "/about" },
    { label: "聯絡我們", href: "/contact" },
    { label: "隱私權政策", href: "/privacy" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* 左側品牌 Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm transition-transform group-hover:scale-105">
            <Clapperboard className="h-4 w-4" />
          </span>
          <span className="font-serif text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            影視戴爾瑞
          </span>
        </Link>

        {/* 右側導覽：首頁 + 三條槓下拉選單 */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400"
          >
            首頁
          </Link>

          {/* 三條槓下拉選單容器 */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="開啟導覽選單"
              aria-expanded={menuOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {menuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}