"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Film, ArrowUpDown } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  category?: string;
  coverImage?: string;
  excerpt?: string;
}

export default function PostFilterSection({ posts }: { posts: Post[] }) {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // 自動從所有文章中萃取不重複的分類
  const categories = useMemo(() => {
    const cats = posts.map((p) => p.category).filter(Boolean) as string[];
    return ["全部", ...Array.from(new Set(cats))];
  }, [posts]);

  // 依選擇的分類與排序規則過濾文章
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (selectedCategory !== "全部") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [posts, selectedCategory, sortOrder]);

  return (
    <section className="mt-12">
      {/* 標題與排序控制列 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="text-amber-600 dark:text-amber-400">｜</span> 更多文章
        </h2>

        {/* 排序切換按鈕 */}
        <button
          onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>{sortOrder === "newest" ? "最新發布優先" : "最早發布優先"}</span>
        </button>
      </div>

      {/* 分類膠囊標籤列 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              selectedCategory === cat
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 文章網格列表 */}
      {filteredPosts.length === 0 ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
          沒有找到符合條件的文章。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              {post.coverImage && (
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
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
                    <h3 className="font-serif text-base font-bold text-slate-900 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 inline-flex items-center gap-1"
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