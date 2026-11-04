import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/notion";
import { formatDate } from "@/lib/utils";
import { Calendar, Film, Tag } from "lucide-react";

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-amber-700">
      <div>
        {/* 精緻小圖封面 (16:9 比例，帶有 Hover 微縮放動畫) */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            // 若文章未包含圖片時的預設微漸層風格佔位圖
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-800 text-slate-300 dark:text-slate-600">
              <Film className="h-10 w-10 opacity-50" />
            </div>
          )}
        </div>

        {/* 內容區塊 */}
        <div className="p-5">
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

          {/* 標題 (字體適度縮小為精緻的 16~17px，行距舒適且限制 2 行防破版) */}
          <h2 className="mt-2.5 font-sans text-base sm:text-[17px] font-semibold leading-snug text-slate-900 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            <Link href={`/posts/${post.slug}`} className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h2>
        </div>
      </div>

      {/* 標籤 */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-5 pt-0">
          {post.tags.slice(0, 3).map((tag) => (
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
    </article>
  );
}
