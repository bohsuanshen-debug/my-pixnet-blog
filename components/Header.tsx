"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Film, Sparkles, ExternalLink } from "lucide-react";

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

  const siteLinks = [
    { label: "關於我們", href: "/about" },
    { label: "聯絡我們", href: "/contact" },
    { label: "隱私權政策", href: "/privacy" },
  ];

  const socialLinks = [
    {
      label: "FB｜影視戴爾瑞",
      href: "https://www.facebook.com/bohsuanmoviediary",
      icon: Film,
    },
    {
      label: "IG｜bh_moviediary",
      href: "https://www.instagram.com/bh_moviediary",
      icon: Sparkles,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* 左側：完全還原你原本的 Logo 圖片與品牌樣式 */}
        <Link href="/" className="group flex items-center gap-2.5">
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

        {/* 右側：首頁連結 + 三條槓下拉式選單 */}
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link
            href="/"
            className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            首頁
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="開啟導覽選單"
              aria-expanded={menuOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50/80 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {menuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-slate-200/80 bg-white py-2 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                {/* 區塊一：網站資訊 */}
                <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400">
                  網站資訊
                </div>
                {siteLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                  >
                    {item.label}
                  </Link>
                ))}

                {/* 分隔線 */}
                <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                {/* 區塊二：社群追蹤 */}
                <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400">
                  追蹤社群
                </div>
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{social.label}</span>
                      </span>
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}