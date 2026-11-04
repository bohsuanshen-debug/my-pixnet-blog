import React from "react";
import { getAllPosts } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import AdSense from "@/components/AdSense";
import FeaturedHero from "@/components/FeaturedHero";
import { Sparkles, Film } from "lucide-react";

// Vercel ISR: 每 60 秒在背景增量重新驗證一次，快取極速響應
export const revalidate = 60;

export default async function HomePage() {
  const posts = await getAllPosts();

  // 提取所有不重複的分類
  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* 雜誌風 Hero Header */}
      <section className="mb-14 text-center sm:text-left border-b border-slate-200/80 pb-10 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300 mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>電影 × 影集 心得分享</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          影視戴爾瑞
        </h1>
        <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          紀錄影視感動瞬間。分享電影、影集心得
        </p>

        {/* 社群連結 */}
        <div className="mt-3 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
          <a
            href="https://www.facebook.com/bohsuanmoviediary"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            <Film className="h-3.5 w-3.5" />
            FB｜影視戴爾瑞
          </a>
          <a
            href="https://www.instagram.com/bohsuan_movie"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-100 transition-colors dark:bg-pink-950/40 dark:text-pink-300 dark:hover:bg-pink-900/50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            IG｜bohsuan_movie
          </a>
        </div>

        {/* 分類導覽標籤 */}
        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-slate-400 mr-1">
              <Film className="h-3.5 w-3.5" /> 分類：
            </span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 文章列表 + 首頁流中廣告 (In-Feed Ad) */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-800">
          尚未發現發布的文章，請確認 Notion Database 已正確設定並公開發布。
        </div>
      ) : (
        <div className="space-y-10">
          {/* ① 精選 Hero：最新 3 篇大圖展示 */}
          <FeaturedHero posts={posts.slice(0, 3)} />

          {/* ② 分隔線 + 更多文章標題 */}
          {posts.length > 3 && (
            <>
              <div className="flex items-center gap-3 pt-2">
                <span className="inline-block h-5 w-1 rounded-full bg-amber-500 shrink-0" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
                  更多文章
                </h2>
                <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
              </div>

              {/* ③ 廣告版位：In-Feed */}
              <div className="-mt-4">
                <AdSense slotType="in-feed" />
              </div>

              {/* ④ 剩餘文章 2 欄卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.slice(3).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
