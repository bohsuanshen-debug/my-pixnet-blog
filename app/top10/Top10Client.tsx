"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TOP_10_MOVIES,
  TOP_10_SERIES,
  TOP_10_GAMES,
  Top10Item,
} from "@/lib/top10-data";
import { Film, Tv, Gamepad2, ArrowRight, Clock, Star } from "lucide-react";

type CategoryType = "movie" | "series" | "game";

export default function Top10Client() {
  const [activeTab, setActiveTab] = useState<CategoryType>("movie");

  const categoryData: Record<
    CategoryType,
    { title: string; subtitle: string; icon: any; items: Top10Item[] }
  > = {
    movie: {
      title: "沈伯的人生十大電影",
      subtitle: "跨越時空與維度的光影震撼，深烙在心底的十部電影傑作",
      icon: Film,
      items: TOP_10_MOVIES,
    },
    series: {
      title: "沈伯的人生十大影集",
      subtitle: "劇本深度與人物張力拉滿，讓人廢寢忘食徹夜追完的影集神作",
      icon: Tv,
      items: TOP_10_SERIES,
    },
    game: {
      title: "沈伯的人生十大電玩",
      subtitle: "從沉浸世界到心靈震撼，定義沈伯玩家生涯的十部遊戲巔峰",
      icon: Gamepad2,
      items: TOP_10_GAMES,
    },
  };

  const current = categoryData[activeTab];

  return (
    <div
      className="min-h-screen transition-colors relative overflow-hidden bg-[#EBEBD8] dark:bg-slate-950 pb-20"
      style={{
        backgroundImage: `
          radial-gradient(at 10% 15%, rgba(155, 166, 133, 0.45) 0px, transparent 50%),
          radial-gradient(at 90% 10%, rgba(99, 117, 69, 0.35) 0px, transparent 50%),
          radial-gradient(at 50% 85%, rgba(69, 82, 48, 0.3) 0px, transparent 50%),
          linear-gradient(135deg, #EBEBD8 0%, #9BA685 60%, #637545 100%)
        `,
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 sm:px-6 relative z-10">
        {/* 頂部標題介紹 */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            沈伯的人生十大
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-700/90 dark:text-slate-300">
            沒有標準答案，自己的品味自己決定！排名隨時更新的私心十大片單與遊戲庫。
          </p>

          {/* 三合一分類切換分頁 */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-xs dark:border-slate-700/50 dark:bg-slate-900/40">
            <button
              type="button"
              onClick={() => setActiveTab("movie")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "movie"
                  ? "bg-[#455230] text-[#EBEBD8] shadow-md scale-102"
                  : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Film className="h-4 w-4" />
              <span>十大電影</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("series")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "series"
                  ? "bg-[#455230] text-[#EBEBD8] shadow-md scale-102"
                  : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Tv className="h-4 w-4" />
              <span>十大影集</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("game")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "game"
                  ? "bg-[#455230] text-[#EBEBD8] shadow-md scale-102"
                  : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Gamepad2 className="h-4 w-4" />
              <span>十大電玩</span>
            </button>
          </div>
        </div>

        {/* 分類導言 */}
        <div className="mb-6 flex items-center justify-between border-b border-[#455230]/15 pb-4 dark:border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#455230] dark:text-amber-300">
              {current.title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {current.subtitle}
            </p>
          </div>
          <span className="rounded-full bg-[#455230]/10 px-3 py-1 text-xs font-bold text-[#455230] dark:bg-amber-400/20 dark:text-amber-200">
            TOP 1 - 10
          </span>
        </div>

        {/* 10 部作品卡片清單 */}
        <div className="space-y-4 sm:space-y-5">
          {current.items.map((item) => {
            const isReviewed = Boolean(item.slug);
            const CardWrapper = isReviewed ? Link : "div";
            const wrapperProps = isReviewed
              ? { href: `/posts/${item.slug}` }
              : {};

            return (
              <CardWrapper
                key={item.rank}
                {...(wrapperProps as any)}
                className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 overflow-hidden rounded-2xl border border-white/60 bg-white/45 p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-2xl transition-all duration-300 dark:border-slate-700/50 dark:bg-slate-900/35 ${
                  isReviewed
                    ? "hover:-translate-y-1 hover:border-white hover:bg-white/65 hover:shadow-xl cursor-pointer"
                    : "opacity-95"
                }`}
              >
                {/* 排名勳章 + 封面照 */}
                <div className="flex items-center gap-3.5 sm:gap-5 w-full sm:w-auto shrink-0">
                  {/* 金牌 / 銀牌 / 銅牌 / 排名編號 */}
                  <div
                    className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl font-black text-base sm:text-lg shadow-sm border ${
                      item.rank === 1
                        ? "bg-amber-400 text-amber-950 border-amber-300 shadow-amber-400/40"
                        : item.rank === 2
                        ? "bg-slate-200 text-slate-800 border-slate-300"
                        : item.rank === 3
                        ? "bg-amber-700 text-amber-100 border-amber-600"
                        : "bg-[#455230]/10 text-[#455230] border-[#455230]/20 dark:bg-white/10 dark:text-amber-200"
                    }`}
                  >
                    #{item.rank}
                  </div>

                  {/* 直式海報封面 */}
                  <div className="relative h-28 w-20 sm:h-32 sm:w-22 shrink-0 overflow-hidden rounded-xl border border-white/70 bg-white/30 dark:border-slate-700/60 dark:bg-slate-800/40 shadow-xs">
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* 手機版：標題與狀態排在海報右側 */}
                  <div className="flex sm:hidden flex-1 min-w-0 flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      {item.year && <span>{item.year} 年</span>}
                    </div>
                    <h3 className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.tagline}
                    </p>
                  </div>
                </div>

                {/* 電腦版：中間作品名稱、入榜短評、評分 */}
                <div className="hidden sm:flex flex-1 min-w-0 flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#455230] dark:text-slate-100 dark:group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    {item.year && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({item.year})
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 text-sm text-slate-700/90 dark:text-slate-300/90 leading-relaxed">
                    {item.tagline}
                  </p>

                  {/* 若已寫過評分，顯示標籤 */}
                  {isReviewed && (item.watchScore !== undefined || item.recommendScore !== undefined) && (
                    <div className="mt-2.5 flex items-center gap-2">
                      {item.watchScore !== undefined && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#455230] px-2.5 py-0.5 text-xs font-semibold text-[#EBEBD8]">
                          <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                          <span>超主觀 {item.watchScore}分</span>
                        </span>
                      )}
                      {item.recommendScore !== undefined && (
                        <span className="rounded-md border border-[#637545]/30 bg-[#EBEBD8]/90 px-2.5 py-0.5 text-xs font-semibold text-[#455230]">
                          爆米花 {item.recommendScore}/10
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 右側按鈕：已寫心得 vs. 即將補上 */}
                <div className="w-full sm:w-auto shrink-0 flex items-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#455230]/10 dark:border-white/10">
                  {isReviewed ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#455230] px-4 py-2 text-xs font-bold text-[#EBEBD8] group-hover:bg-[#343e24] shadow-xs transition-all active:scale-95">
                      <span>閱讀完整心得</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-xl border border-slate-300/70 bg-white/30 px-3.5 py-1.5 text-xs font-medium text-slate-500 backdrop-blur-xs dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-slate-400 select-none">
                      <Clock className="h-3.5 w-3.5 opacity-60" />
                      <span>文章即將補上</span>
                    </span>
                  )}
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </div>
  );
}