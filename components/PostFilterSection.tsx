"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, Film, ArrowUpDown } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface PostItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  category?: string;
  coverImage?: string;
  excerpt?: string;
}

export default function PostFilterSection({ posts }: { posts: PostItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // 自動萃取所有不重複的文章分類
  const categories = useMemo(() => {
    const validCategories = posts
      .map((post) => post.category)
      .filter((cat): cat is string => Boolean(cat && cat.trim() !== ""));
    return ["全部", ...Array.from(new Set(validCategories))];
  }, [posts]);

  // 執行分類篩選與日期排序
  const filteredPosts = useMemo(() => {
    const filtered =
      selectedCategory === "全部"
        ? [...posts]
        : posts.filter((post) => post.category === selectedCategory);

    return filtered.sort((a, b) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [posts, selectedCategory, sortOrder]);

  return (
    <section className="mt-10">
      {/* 標題與排序切換列 */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          <span className="text-amber-600 dark:text-amber-400">｜</span>
          <span>更多文章</span>
          <span className="ml-1 text-xs font-normal text-slate-400">
            ({filteredPosts.length})
          </span>
        </h2>

        <button
          type="button"
          onClick={() =>
            setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
          }
          className="inline-flex items-center gap-1.5 self-start rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:self-auto"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>{sortOrder === "newest" ? "最新發布優先" : "最早發布優先"}</span>
        </button>
      </div>

      {/* 分類膠囊篩選按鈕 */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* 文章列表網格 */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          目前沒有符合「{selectedCategory}」分類的文章。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              {post.coverImage && (
                <Link
                  href={`/posts/${post.slug}`}
                  className="block aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
                >
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              )}

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="mb-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {post.category && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        <Film className="h-3 w-3" />
                        {post.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </span>
                  </div>

                  <Link href={`/posts/${post.slug}`}>
                    <h3 className="line-clamp-2 font-serif text-base font-bold text-slate-900 transition-colors group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400">
                      {post.title}
                    </h3>
                  </Link>

                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex justify-end border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400"
                  >
                    閱讀全文 →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}