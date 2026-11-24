import React, { Suspense } from "react";
import { getAllPosts } from "@/lib/notion";
import FeaturedHero from "@/components/FeaturedHero";
import PostFilterSection from "@/components/PostFilterSection";
import HomeShareSection from "@/components/HomeShareSection";

// Vercel ISR: 每 60 秒在背景增量重新驗證一次，讓 Notion 更新在 1 分鐘內快速同步
export const revalidate = 60;

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <div
      className="min-h-screen transition-colors relative overflow-hidden bg-[#EBEBD8] dark:bg-slate-950"
      style={{
        backgroundImage: `
          radial-gradient(at 10% 15%, rgba(155, 166, 133, 0.45) 0px, transparent 50%),
          radial-gradient(at 90% 10%, rgba(99, 117, 69, 0.35) 0px, transparent 50%),
          radial-gradient(at 50% 85%, rgba(69, 82, 48, 0.3) 0px, transparent 50%),
          linear-gradient(135deg, #EBEBD8 0%, #9BA685 60%, #637545 100%)
        `,
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 sm:px-6 relative z-10">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-800 bg-white/70 backdrop-blur-md dark:bg-slate-900/60">
            尚未發現發布的文章，請確認 Notion Database 已正確設定並公開發布。
          </div>
        ) : (
          <div className="space-y-10">
            {/* ① 精選 Hero：最新 3 篇大圖展示 */}
            <FeaturedHero posts={posts.slice(0, 3)} />

            {/* ② 全部文章（支援 Header 分類導流、即時搜尋、年份與評分排序） */}
            <Suspense
              fallback={
                <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                  載入文章列表中...
                </div>
              }
            >
              <PostFilterSection posts={posts} />
            </Suspense>

            {/* ③ 首頁底部推薦與分享模組 */}
            <HomeShareSection />
          </div>
        )}
      </div>
    </div>
  );
}