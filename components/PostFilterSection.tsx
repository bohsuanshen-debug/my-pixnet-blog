"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import PostCard from "@/components/PostCard";
import AdSense from "@/components/AdSense";
import { BlogPost } from "@/lib/notion";
import { ArrowUpDown, ChevronDown, Check } from "lucide-react";

type SortOption =
  | "date-desc"
  | "date-asc"
  | "watch-desc"
  | "watch-asc"
  | "recommend-desc"
  | "recommend-asc";

const SORT_OPTIONS: {
  value: SortOption;
  label: string;
  shortLabel: string;
  group: string;
}[] = [
  {
    value: "date-desc",
    label: "最新發布優先",
    shortLabel: "最新優先",
    group: "發布日期",
  },
  {
    value: "date-asc",
    label: "最早發布優先",
    shortLabel: "最早優先",
    group: "發布日期",
  },
  {
    value: "watch-desc",
    label: "好看指數：由高到低",
    shortLabel: "好看指數 (高→低)",
    group: "沈伯的評分排序",
  },
  {
    value: "watch-asc",
    label: "好看指數：由低到高",
    shortLabel: "好看指數 (低→高)",
    group: "沈伯的評分排序",
  },
  {
    value: "recommend-desc",
    label: "推薦指數：由高到低",
    shortLabel: "推薦指數 (高→低)",
    group: "沈伯的評分排序",
  },
  {
    value: "recommend-asc",
    label: "推薦指數：由低到高",
    shortLabel: "推薦指數 (低→高)",
    group: "沈伯的評分排序",
  },
];

function compareNullableScore(
  scoreA: number | undefined,
  scoreB: number | undefined,
  direction: "asc" | "desc"
): number {
  const hasA = typeof scoreA === "number" && !Number.isNaN(scoreA);
  const hasB = typeof scoreB === "number" && !Number.isNaN(scoreB);
  if (!hasA && !hasB) return 0;
  if (!hasA) return 1; // 尚未設定評分的文章排在最後
  if (!hasB) return -1;
  return direction === "desc" ? scoreB - scoreA : scoreA - scoreB;
}

export default function PostFilterSection({ posts }: { posts: BlogPost[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [selectedYear, setSelectedYear] = useState<string>("全部");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // 點擊外部自動關閉排序下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 自動萃取不重複分類
  const categories = useMemo(() => {
    const validCats = posts
      .map((p) => p.category)
      .filter((cat): cat is string => Boolean(cat && cat.trim() !== ""));
    return ["全部", ...Array.from(new Set(validCats))];
  }, [posts]);

  // 自動萃取不重複上映年份（由新到舊排列）
  const releaseYears = useMemo(() => {
    const validYears = posts
      .map((p) => p.releaseYear)
      .filter((year): year is string => Boolean(year && year.trim() !== ""));
    const uniqueSorted = Array.from(new Set(validYears)).sort((a, b) =>
      b.localeCompare(a)
    );
    return ["全部", ...uniqueSorted];
  }, [posts]);

  // 同時套用「分類篩選」、「上映年份篩選」與「日期／沈伯評分排序」
  const filteredPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      const matchCategory =
        selectedCategory === "全部" || post.category === selectedCategory;
      const matchYear =
        selectedYear === "全部" || post.releaseYear === selectedYear;
      return matchCategory && matchYear;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "watch-desc":
          return compareNullableScore(a.watchScore, b.watchScore, "desc");
        case "watch-asc":
          return compareNullableScore(a.watchScore, b.watchScore, "asc");
        case "recommend-desc":
          return compareNullableScore(
            a.recommendScore,
            b.recommendScore,
            "desc"
          );
        case "recommend-asc":
          return compareNullableScore(
            a.recommendScore,
            b.recommendScore,
            "asc"
          );
        case "date-asc": {
          const timeA = new Date(a.date).getTime() || 0;
          const timeB = new Date(b.date).getTime() || 0;
          return timeA - timeB;
        }
        case "date-desc":
        default: {
          const timeA = new Date(a.date).getTime() || 0;
          const timeB = new Date(b.date).getTime() || 0;
          return timeB - timeA;
        }
      }
    });
  }, [posts, selectedCategory, selectedYear, sortBy]);

  const currentSort =
    SORT_OPTIONS.find((opt) => opt.value === sortBy) || SORT_OPTIONS[0];

  return (
    <>
      {/* ② 分隔線 + 更多文章標題 + 黃圈處排序選單 + 雙重篩選器 */}
      <div className="flex flex-col gap-3.5 pt-2 border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-block h-5 w-1 rounded-full bg-amber-500 shrink-0" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
              更多文章
            </h2>
            <span className="text-xs text-slate-400">
              ({filteredPosts.length})
            </span>
          </div>

          {/* 黃圈處：整合發布時間與「沈伯的評分排序」下拉選單 */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setSortMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{currentSort.shortLabel}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 opacity-60 transition-transform ${
                  sortMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sortMenuOpen && (
              <div className="absolute right-0 z-30 mt-2 w-52 origin-top-right rounded-xl border border-slate-200/80 bg-white py-2 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                {/* 群組 1：發布日期 */}
                <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400">
                  發布日期
                </div>
                {SORT_OPTIONS.filter((opt) => opt.group === "發布日期").map(
                  (opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && (
                        <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      )}
                    </button>
                  )
                )}

                <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                {/* 群組 2：沈伯的評分排序 */}
                <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-amber-600 dark:text-amber-400">
                  沈伯的評分排序
                </div>
                {SORT_OPTIONS.filter(
                  (opt) => opt.group === "沈伯的評分排序"
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.value && (
                      <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 篩選列 1：文章分類 */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-0.5">
              分類：
            </span>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* 篩選列 2：上映年份（自動從文章內擷取） */}
        {releaseYears.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-0.5">
              上映年份：
            </span>
            {releaseYears.map((year) => {
              const isActive = selectedYear === year;
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-800 text-white shadow-sm dark:bg-amber-500 dark:text-slate-950"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {year === "全部" ? "全部年份" : `${year}`}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ③ 廣告版位：In-Feed */}
      <div className="-mt-4">
        <AdSense slotType="in-feed" />
      </div>

      {/* ④ 文章 2 欄卡片 */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-800">
          目前沒有符合「
          {selectedCategory !== "全部" ? selectedCategory : "全部分類"}
          {selectedYear !== "全部" ? ` · ${selectedYear} 年` : ""}
          」條件的文章。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}