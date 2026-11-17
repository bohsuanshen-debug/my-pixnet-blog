"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import PostCard from "@/components/PostCard";
import AdSense from "@/components/AdSense";
import { BlogPost } from "@/lib/notion";
import {
  ArrowUpDown,
  ChevronDown,
  Check,
  FolderOpen,
  CalendarRange,
  RotateCcw,
} from "lucide-react";

type SortOption =
  | "date-desc"
  | "date-asc"
  | "watch-desc"
  | "watch-asc"
  | "recommend-desc"
  | "recommend-asc";

interface PostFilterSectionProps {
  posts: BlogPost[];
}

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
    label: "超主觀評分：由高到低",
    shortLabel: "超主觀評分 (高→低)",
    group: "沈伯的評分排序",
  },
  {
    value: "watch-asc",
    label: "超主觀評分：由低到高",
    shortLabel: "超主觀評分 (低→高)",
    group: "沈伯的評分排序",
  },
  {
    value: "recommend-desc",
    label: "爆米花指數：由高到低",
    shortLabel: "爆米花指數 (高→低)",
    group: "沈伯的評分排序",
  },
  {
    value: "recommend-asc",
    label: "爆米花指數：由低到高",
    shortLabel: "爆米花指數 (低→高)",
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
  if (!hasA) return 1;
  if (!hasB) return -1;
  return direction === "desc" ? scoreB - scoreA : scoreA - scoreB;
}

export default function PostFilterSection(props: PostFilterSectionProps) {
  const posts = props.posts;
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [selectedYear, setSelectedYear] = useState<string>("全部");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [openMenu, setOpenMenu] = useState<"category" | "year" | "sort" | null>(
    null
  );

  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        controlsRef.current &&
        !controlsRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = useMemo(() => {
    const validCats = posts
      .map((p) => p.category)
      .filter((cat): cat is string => Boolean(cat && cat.trim() !== ""));
    return ["全部", ...Array.from(new Set(validCats))];
  }, [posts]);

  const releaseYears = useMemo(() => {
    const validYears = posts
      .map((p) => p.releaseYear)
      .filter((year): year is string => Boolean(year && year.trim() !== ""));
    const uniqueSorted = Array.from(new Set(validYears)).sort((a, b) =>
      b.localeCompare(a)
    );
    return ["全部", ...uniqueSorted];
  }, [posts]);

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
  const hasActiveFilter =
    selectedCategory !== "全部" || selectedYear !== "全部";

  return (
    <React.Fragment>
      {/* 分隔線 + 全部文章標題 + 三合一精簡下拉控制列 */}
      <div
        ref={controlsRef}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 pt-2 border-b border-slate-200/80 pb-4 dark:border-slate-800"
      >
        {/* 左側標題（已放大字體並改為全部文章） */}
        <div className="flex items-center gap-3">
          <span className="inline-block h-6 w-1 rounded-full bg-amber-500 shrink-0" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
            全部文章
          </h2>
          <span className="text-sm font-medium text-slate-400">
            ({filteredPosts.length})
          </span>
        </div>

        {/* 右側三個統一風格下拉選單：分類 / 上映年份 / 排序 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. 分類下拉選單 */}
          {categories.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((prev) =>
                    prev === "category" ? null : "category"
                  )
                }
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory !== "全部"
                    ? "border-amber-500/40 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-950/50 dark:text-amber-300"
                    : "border-slate-200/80 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <FolderOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {selectedCategory === "全部" ? "全部分類" : selectedCategory}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 opacity-60 transition-transform ${
                    openMenu === "category" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openMenu === "category" && (
                <div className="absolute left-0 sm:right-0 sm:left-auto z-30 mt-2 w-40 origin-top rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400">
                    文章分類
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setOpenMenu(null);
                      }}
                      className="flex w-full items-center justify-between px-3.5 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                    >
                      <span>{cat === "全部" ? "全部分類" : cat}</span>
                      {selectedCategory === cat && (
                        <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. 上映年份下拉選單 */}
          {releaseYears.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((prev) => (prev === "year" ? null : "year"))
                }
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedYear !== "全部"
                    ? "border-amber-500/40 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-950/50 dark:text-amber-300"
                    : "border-slate-200/80 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <CalendarRange className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {selectedYear === "全部" ? "上映年份" : `${selectedYear} 年`}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 opacity-60 transition-transform ${
                    openMenu === "year" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openMenu === "year" && (
                <div className="absolute left-0 sm:right-0 sm:left-auto z-30 mt-2 max-h-64 w-36 overflow-y-auto origin-top rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400">
                    上映年份
                  </div>
                  {releaseYears.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setSelectedYear(year);
                        setOpenMenu(null);
                      }}
                      className="flex w-full items-center justify-between px-3.5 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                    >
                      <span>{year === "全部" ? "全部年份" : `${year} 年`}</span>
                      {selectedYear === year && (
                        <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. 排序下拉選單（發布日期 + 沈伯的評分排序） */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu((prev) => (prev === "sort" ? null : "sort"))
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{currentSort.shortLabel}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 opacity-60 transition-transform ${
                  openMenu === "sort" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openMenu === "sort" && (
              <div className="absolute right-0 z-30 mt-2 w-56 origin-top-right rounded-xl border border-slate-200/80 bg-white py-2 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
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
                        setOpenMenu(null);
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
                      setOpenMenu(null);
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

          {/* 清除篩選快捷按鈕 */}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("全部");
                setSelectedYear("全部");
                setOpenMenu(null);
              }}
              title="重設篩選條件"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <RotateCcw className="h-3 w-3" />
              <span>重設</span>
            </button>
          )}
        </div>
      </div>

      {/* 廣告版位：In-Feed */}
      <div className="-mt-4">
        <AdSense slotType="in-feed" />
      </div>

      {/* 文章 2 欄卡片 */}
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
    </React.Fragment>
  );
}