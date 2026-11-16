"use client";

import React, { useState, useMemo } from "react";
import PostCard from "@/components/PostCard";
import AdSense from "@/components/AdSense";
import { ArrowUpDown } from "lucide-react";

type PostType = React.ComponentProps<typeof PostCard>["post"];

export default function PostFilterSection({ posts }: { posts: PostType[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // 自動從文章中取得不重複的分類
  const categories = useMemo(() => {
    const validCats = posts
      .map((p) => p.category)
      .filter((cat): cat is string => Boolean(cat && cat.trim() !== ""));
    return ["全部", ...Array.from(new Set(validCats))];
  }, [posts]);

  // 依據分類與時間進行篩選與排序
  const filteredPosts = useMemo(() => {
    const result =
      selectedCategory === "全部"
        ? [...posts]
        : posts.filter((p) => p.category === selectedCategory);

    return result.sort((a, b) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [posts, selectedCategory, sortOrder]);

  return (
    <>
      {/* ② 分隔線 + 更多文章標題 + 篩選與排序控制列（原本紅圈空白處） */}
      <div className="flex flex-col gap-4 pt-2 border-b border-slate-200/80 pb-4 dark:border-slate-800">
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

          {/* 排序切換按鈕 */}
          <button
            type="button"
            onClick={() =>
              setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>{sortOrder === "newest" ? "最新優先" : "最早優先"}</span>
          </button>
        </div>

        {/* 分類篩選膠囊按鈕 */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
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
      </div>

      {/* ③ 保留原本的廣告版位：In-Feed */}
      <div className="-mt-4">
        <AdSense slotType="in-feed" />
      </div>

      {/* ④ 沿用你原本的 PostCard 2 欄卡片 */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-800">
          目前沒有符合「{selectedCategory}」分類的文章。
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