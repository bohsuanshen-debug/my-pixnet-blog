import React, { Suspense } from "react";
import { getAllPosts } from "@/lib/notion";
import FeaturedHero from "@/components/FeaturedHero";
import PostFilterSection from "@/components/PostFilterSection";

// Vercel ISR: 每 600 秒在背景增量重新驗證一次，配合快取保護機制極速響應
export const revalidate = 600;

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 sm:px-6">
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-800">
          尚未發現發布的文章，請確認 Notion Database 已正確設定並公開發布。
        </div>
      ) : (
        <div className="space-y-10">
          {/* ① 精選 Hero：最新 3 篇大圖展示 */}
          <FeaturedHero posts={posts.slice(0, 3)} />

          {/* ② 全部文章（支援 Header 分類導流、即時搜尋、年份與評分排序） */}
          <Suspense
            fallback={
              <div className="py-12 text-center text-sm text-slate-400">
                載入文章列表中...
              </div>
            }
          >
            <PostFilterSection posts={posts} />
          </Suspense>
        </div>
      )}
    </div>
  );
}