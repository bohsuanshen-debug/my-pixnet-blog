import React from "react";
import Link from "next/link";
import { BlogPost } from "@/lib/notion";
import { formatDate } from "@/lib/utils";
import { Calendar, Tag } from "lucide-react";

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-amber-700">
      <div>
        {/* 分類與發布日期 */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
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
        <h2 className="mt-3.5 font-serif text-xl font-bold leading-snug tracking-tight text-slate-900 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400 transition-colors">
          <Link href={`/posts/${post.slug}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {post.title}
          </Link>
        </h2>
      </div>

      {/* 標籤 */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 pt-2">
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
