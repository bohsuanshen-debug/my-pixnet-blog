import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/notion";
import { formatDate } from "@/lib/utils";
import { Calendar, Film, Tag } from "lucide-react";

export default function PostCard({ post }: { post: BlogPost }) {
  const hasRatings =
    post.watchScore !== undefined || post.recommendScore !== undefined;

  return (
    <article className="group relative flex items-center justify-between gap-4 sm:gap-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-amber-700">
      {/* 左側：文章元資料、標題、評分與標籤 */}
      <div className="flex flex-1 min-w-0 flex-col justify-between self-stretch">
        <div>
          {/* 分類與發布日期 */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {post.category && (
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                {post.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </span>
          </div>

          {/* 標題 */}
          <h2 className="mt-2 font-sans text-base sm:text-[17px] font-semibold leading-snug text-slate-900 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            <Link href={`/posts/${post.slug}`} className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h2>

          {/* 自動顯示超主觀評分(100分制)與爆米花指數(10分制) */}
          {hasRatings && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {post.watchScore !== undefined && (
                <span className="inline-flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                  超主觀評分 {post.watchScore}/100
                </span>
              )}
              {post.recommendScore !== undefined && (
                <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                  爆米花指數 {post.recommendScore}/10
                </span>
              )}
            </div>
          )}
        </div>

        {/* 底部標籤 */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              >
                <Tag className="h-2.5 w-2.5 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 右側：直式電影海報縮圖 */}
      <div className="relative h-28 w-[76px] sm:h-36 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-sm dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
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