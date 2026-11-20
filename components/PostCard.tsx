import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/notion";
import { formatDate } from "@/lib/utils";
import { Calendar, Film } from "lucide-react";

function parseMovieTitleAndSubtitle(title: string): {
  mainTitle: string;
  subtitle: string;
} {
  const quoteMatch = title.match(/《([^》]+)》(.*)$/);
  if (quoteMatch) {
    const mainTitle = quoteMatch[1].trim();
    const subtitle = quoteMatch[2].trim();
    return {
      mainTitle: mainTitle || title,
      subtitle,
    };
  }
  return {
    mainTitle: title,
    subtitle: "",
  };
}

export default function PostCard({ post }: { post: BlogPost }) {
  const hasRatings =
    post.watchScore !== undefined || post.recommendScore !== undefined;
  const { mainTitle, subtitle } = parseMovieTitleAndSubtitle(post.title);

  return (
    <article className="group relative flex items-stretch justify-between gap-4 sm:gap-5 overflow-hidden rounded-2xl border border-white/50 bg-white/25 p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white/40 hover:shadow-xl dark:border-slate-700/40 dark:bg-slate-900/25 dark:backdrop-blur-2xl dark:hover:border-slate-500 dark:hover:bg-slate-900/40">
      {/* 左側：文章元資料、放大的片名、單行副標；底部評分指標貼齊封面 */}
      <div className="flex flex-1 min-w-0 flex-col justify-between">
        <div className="min-w-0">
          {/* 分類與發布日期 */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            {post.category && (
              <span className="inline-flex items-center rounded-md bg-white/45 dark:bg-white/10 px-2.5 py-0.5 font-medium text-[#455230] dark:text-amber-300 border border-white/50 dark:border-white/10">
                {post.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 opacity-70" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </span>
          </div>

          {/* 放大的片名 */}
          <h2 className="mt-2 font-sans text-lg sm:text-xl font-bold leading-snug text-slate-900 group-hover:text-[#455230] dark:text-slate-100 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
            <Link href={`/posts/${post.slug}`} className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              {mainTitle}
            </Link>
          </h2>

          {/* 原副標（單行顯示） */}
          {subtitle && (
            <p className="mt-1 truncate text-xs sm:text-sm text-slate-700/90 dark:text-slate-300/90">
              {subtitle}
            </p>
          )}
        </div>

        {/* 放大的雙指標：超主觀評分僅顯示數字，與右側封面照底部貼齊 */}
        {hasRatings && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {post.watchScore !== undefined && (
              <span className="inline-flex items-center rounded-lg border border-[#455230]/25 bg-[#455230] px-3 py-1 text-xs sm:text-[13px] font-semibold text-[#EBEBD8] shadow-xs dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-200">
                超主觀評分 {post.watchScore}
              </span>
            )}
            {post.recommendScore !== undefined && (
              <span className="inline-flex items-center rounded-lg border border-[#637545]/35 bg-[#EBEBD8]/85 px-3 py-1 text-xs sm:text-[13px] font-semibold text-[#455230] shadow-xs dark:border-emerald-400/30 dark:bg-emerald-950/50 dark:text-emerald-300">
                爆米花指數 {post.recommendScore}/10
              </span>
            )}
          </div>
        )}
      </div>

      {/* 右側：直式電影／影集海報縮圖 */}
      <div className="relative h-28 w-[76px] sm:h-36 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-white/20 shadow-xs dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/50">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={mainTitle}
            fill
            sizes="(max-width: 640px) 80px, 100px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300 dark:from-slate-850 dark:to-slate-800 dark:text-slate-600">
            <Film className="h-6 w-6 opacity-40" />
          </div>
        )}
      </div>
    </article>
  );
}