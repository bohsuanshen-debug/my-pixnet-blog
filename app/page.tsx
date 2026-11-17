import React from "react";
import { getAllPosts } from "@/lib/notion";
import FeaturedHero from "@/components/FeaturedHero";
import PostFilterSection from "@/components/PostFilterSection";
import { Sparkles, Film } from "lucide-react";

// Vercel ISR: 每 600 秒在背景增量重新驗證一次，配合快取保護機制極速響應
export const revalidate = 600;

export default async function HomePage() {
  const posts = await getAllPosts();

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
            href="https://www.instagram.com/bh_moviediary"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-100 transition-colors dark:bg-pink-950/40 dark:text-pink-300 dark:hover:bg-pink-900/50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            IG｜bh_moviediary
          </a>
        </div>
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

          {/* ② 全部文章（完整收錄包含最新精選在內的所有文章，含分類篩選、年份與評分排序） */}
          <PostFilterSection posts={posts} />
        </div>
      )}
    </div>
  );
}