import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/notion";
import { formatDate } from "@/lib/utils";
import { Calendar, ArrowRight, Film } from "lucide-react";

// ─── 主 Hero 卡（最新一篇，全寬大圖）────────────────────────────────────────
function HeroMain({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative block w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg hover:shadow-xl transition-shadow duration-300 focus:outline-none"
    >
      {/* 背景封面圖 */}
      <div className="relative h-[340px] sm:h-[420px] md:h-[500px] w-full">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 960px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-75"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-900 to-slate-900 flex items-center justify-center">
            <Film className="h-20 w-20 text-amber-500/40" />
          </div>
        )}

        {/* 漸層遮罩：讓文字清晰可讀 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* 文字疊層（固定在圖片底部） */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
        {/* 分類 + 日期 */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.category && (
            <span className="rounded-md bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
              {post.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-white/70">
            <Calendar className="h-3 w-3" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-amber-300 group-hover:text-amber-200 transition-colors">
            閱讀全文 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>

        {/* 標題 */}
        <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold leading-snug text-white group-hover:text-amber-100 transition-colors line-clamp-2">
          {post.title}
        </h2>

        {/* 標籤 */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 backdrop-blur-sm px-2.5 py-0.5 text-[11px] text-white/80"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── 次要精選卡（第2、3篇，並排） ────────────────────────────────────────────
function HeroSecondary({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-slate-900 shadow hover:shadow-lg transition-shadow duration-300 focus:outline-none"
    >
      {/* 封面圖 */}
      <div className="relative h-44 sm:h-52 w-full">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 460px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 brightness-70"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <Film className="h-10 w-10 text-slate-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      </div>

      {/* 文字 */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {post.category && (
            <span className="rounded-md bg-amber-500/90 px-2 py-0.5 text-[11px] font-semibold text-white">
              {post.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] text-white/60">
            <Calendar className="h-2.5 w-2.5" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </span>
        </div>
        <h3 className="font-sans text-sm sm:text-base font-semibold leading-snug text-white group-hover:text-amber-200 transition-colors line-clamp-2">
          {post.title}
        </h3>
      </div>
    </Link>
  );
}

// ─── 匯出：整個精選 Hero 區塊 ─────────────────────────────────────────────────
export default function FeaturedHero({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  const [hero, ...rest] = posts;
  const secondaryPosts = rest.slice(0, 2);

  return (
    <section className="mb-10">
      {/* 區塊標題 */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span className="inline-block h-5 w-1 rounded-full bg-amber-500" />
          最新精選
        </h2>
        <span className="text-xs text-slate-400">最新 {posts.length > 3 ? 3 : posts.length} 篇</span>
      </div>

      {/* Hero 主卡 */}
      <HeroMain post={hero} />

      {/* 次要精選（若有第2、3篇則並排） */}
      {secondaryPosts.length > 0 && (
        <div className={`mt-4 grid gap-4 ${secondaryPosts.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
          {secondaryPosts.map((post) => (
            <HeroSecondary key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
