"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Film, Sparkles, ExternalLink, Layers } from "lucide-react";

const CATEGORY_NAV_ITEMS = [
  { label: "所有文章", category: "全部", href: "/#all-posts" },
  { label: "電影", category: "電影", href: "/?category=電影#all-posts" },
  { label: "影評", category: "影評", href: "/?category=影評#all-posts" },
  { label: "其他", category: "其他", href: "/?category=其他#all-posts" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

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

  const siteLinks = [
    { label: "關於我們", href: "/about" },
    { label: "聯絡我們", href: "/contact" },
    { label: "隱私權政策", href: "/privacy" },
  ];

  // 點擊分類時同步更新網址並平滑捲動至全部文章區塊
  const handleCategoryClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof CATEGORY_NAV_ITEMS)[number]
  ) => {
    setMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const targetUrl =
        item.category === "全部"
          ? "/#all-posts"
          : `/?category=${encodeURIComponent(item.category)}#all-posts`;
      router.push(targetUrl, { scroll: false });
      const el = document.getElementById("all-posts");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* 左側：Logo 圖片與品牌名稱 */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
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

        {/* 右側：四大分類導覽連結 + 漢堡下拉式選單 */}
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <div className="hidden md:flex items-center gap-5">
            {CATEGORY_NAV_ITEMS.map((item) => (
              <Link
                key={item.category}
                href={item.href}
                onClick={(e) => handleCategoryClick(e, item)}
                className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
              >
                {item.label}
              </Link>
            ))}
          </div>

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
              <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-slate-200/80 bg-white py-2 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                {/* 區塊一：文章分類 */}
                <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400">
                  文章分類
                </div>
                {CATEGORY_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.category}
                    href={item.href}
                    onClick={(e) => handleCategoryClick(e, item)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                  >
                    <Layers className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* 分隔線 */}
                <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                {/* 區塊二：追蹤社群（已調換至網站資訊上方） */}
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

                {/* 分隔線 */}
                <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                {/* 區塊三：網站資訊（已調換至追蹤社群下方） */}
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
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}