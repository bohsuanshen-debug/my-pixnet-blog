import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts, getPostBySlug, getPageBlocks, type BlogPost } from "@/lib/notion";
import NotionRenderer from "@/components/NotionRenderer";
import AdSense from "@/components/AdSense";
import AmbientPostLayout from "@/components/AmbientPostLayout";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar, Film, Sparkles } from "lucide-react";

// 快取 10 分鐘，減少不必要的背景 API 請求；一旦生成成功即長期穩定提供快取
export const revalidate = 600;
export const dynamicParams = true;

function extractCardTitle(title: string): string {
  const quoteMatch = title.match(/《([^》]+)》/);
  return quoteMatch?.[1]?.trim() || title;
}

function getRelatedPosts(currentPost: BlogPost, allPosts: BlogPost[], limit = 3): BlogPost[] {
  const currentTags = new Set(currentPost.tags || []);

  const scored = allPosts
    .filter((p) => p.id !== currentPost.id)
    .map((p) => {
      let score = 0;
      if (currentPost.category && p.category === currentPost.category) {
        score += 3;
      }
      const sharedTags = (p.tags || []).filter((t) => currentTags.has(t)).length;
      score += sharedTags * 2;
      const timeWeight = new Date(p.date).getTime() || 0;
      return { post: p, score, timeWeight };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.timeWeight - a.timeWeight;
    });

  return scored.slice(0, limit).map((item) => item.post);
}

// 建置期不並行預編譯文章，避免部署瞬間同時發送數十次 Notion API 請求觸發 429 限流
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.slug);
    if (!post) {
      return { title: "文章不存在" };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bhmoviediary.com";
    const postUrl = `${siteUrl}/posts/${post.slug}`;
    const description =
      post.excerpt || `${post.title} - 由戴爾瑞撰寫的深度影評與觀後心得。`;

    return {
      title: post.title,
      description: description,
      alternates: {
        canonical: postUrl,
      },
      openGraph: {
        title: post.title,
        description: description,
        url: postUrl,
        type: "article",
        publishedTime: post.date,
        authors: ["戴爾瑞"],
        tags: post.tags,
        images: post.coverImage ? [{ url: post.coverImage }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: description,
        images: post.coverImage ? [post.coverImage] : [],
      },
    };
  } catch {
    return { title: "影視戴爾瑞" };
  }
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  // 循序讀取區塊與全站對照表，避免單一頁面同時發起多條並發請求搶佔頻寬
  const blocks = await getPageBlocks(post.id);

  // 雙重保險：若回傳區塊為空，丟出錯誤阻止寫入空白快取
  if (!blocks || blocks.length === 0) {
    throw new Error(`文章區塊為空，拒絕快取空白頁面 (Slug: ${params.slug})`);
  }

  let relatedPostLinks: { slug: string; title: string }[] = [];
  let recommendedPosts: BlogPost[] = [];
  try {
    const allPosts = await getAllPosts();
    relatedPostLinks = allPosts
      .filter((p) => p.id !== post.id)
      .map((p) => ({ slug: p.slug, title: p.title }));
    recommendedPosts = getRelatedPosts(post, allPosts, 3);
  } catch {
    // 延伸閱讀與相關推薦為非核心功能，失敗時靜默略過不影響主內文顯示
  }

  const titleParts = post.title.split("｜").map((part) => part.trim()).filter(Boolean);
  const hasSeriesPrefix =
    titleParts.length >= 2 &&
    (titleParts[0].includes("影評") ||
      titleParts[0].includes("電影日記簿") ||
      titleParts[0].includes("影集說大話"));

  const seriesPrefix = hasSeriesPrefix ? titleParts.slice(0, -1).join(" ｜ ") : null;
  const cleanMainTitle = hasSeriesPrefix ? titleParts[titleParts.length - 1] : post.title;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bhmoviediary.com";
  const postUrl = `${siteUrl}/posts/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    author: {
      "@type": "Person",
      name: "戴爾瑞",
    },
    publisher: {
      "@type": "Organization",
      name: "影視戴爾瑞",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon.ico`,
      },
    },
    image: post.coverImage || undefined,
  };

  return (
    <AmbientPostLayout coverImage={post.coverImage}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 返回按鈕 */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-amber-600 dark:text-neutral-400 dark:hover:text-amber-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回文章列表</span>
        </Link>
      </div>

      {/* 文章標頭資訊 */}
      <header className="mb-8 border-b border-neutral-200/80 pb-8 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 mb-4 font-medium">
          {post.category && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
              <Film className="h-3 w-3" />
              {post.category}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </span>
        </div>

        {/* 主標題區塊 */}
        <div className="space-y-2">
          {seriesPrefix && (
            <p className="text-sm font-semibold tracking-wider text-amber-700 dark:text-amber-400">
              {seriesPrefix}
            </p>
          )}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-snug">
            {cleanMainTitle}
          </h1>
        </div>

        {/* 評分膠囊（若有設定） */}
        {(post.watchScore !== undefined || post.recommendScore !== undefined) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {post.watchScore !== undefined && (
              <span className="inline-flex items-center rounded-md border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
                超主觀評分 {post.watchScore}/100
              </span>
            )}
            {post.recommendScore !== undefined && (
              <span className="inline-flex items-center rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300">
                爆米花指數 {post.recommendScore}/10
              </span>
            )}
          </div>
        )}
      </header>

      {/* 廣告版位 2：文章頁頂部廣告 */}
      <AdSense slotType="article-top" />

      {/* 核心文章內文渲染器 */}
      <main className="my-8 text-neutral-900 dark:text-neutral-100">
        <NotionRenderer
          blocks={blocks}
          insertInArticleAd={true}
          allPosts={relatedPostLinks}
        />
      </main>

      {/* 相關影評推薦卡片區塊 */}
      {recommendedPosts.length > 0 && (
        <section
          aria-label="相關影評推薦"
          className="my-10 rounded-2xl border border-white/60 bg-white/35 p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/35"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="inline-flex items-center gap-2 text-base sm:text-lg font-bold text-[#455230] dark:text-amber-300">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>相關影評推薦</span>
            </h2>
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-[#455230] dark:text-slate-400 dark:hover:text-amber-300 transition-colors"
            >
              看全部文章 →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedPosts.map((item) => {
              const cardTitle = extractCardTitle(item.title);
              return (
                <Link
                  key={item.id}
                  href={`/posts/${item.slug}`}
                  className="group flex items-stretch justify-between gap-3 rounded-xl border border-white/60 bg-white/45 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/70 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/40 dark:hover:border-slate-500 dark:hover:bg-slate-800/70"
                >
                  <div className="flex flex-1 min-w-0 flex-col justify-between">
                    <div className="min-w-0">
                      <span className="inline-block rounded bg-[#455230]/10 px-2 py-0.5 text-[11px] font-semibold text-[#455230] dark:bg-amber-400/15 dark:text-amber-300">
                        {item.category || "影評"}
                      </span>
                      <h3 className="mt-1.5 text-sm font-bold leading-snug text-slate-900 group-hover:text-[#455230] dark:text-slate-100 dark:group-hover:text-amber-300 line-clamp-2 transition-colors">
                        {cardTitle}
                      </h3>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                      {item.watchScore !== undefined && (
                        <span className="rounded bg-[#455230] px-2 py-0.5 text-[#EBEBD8] dark:bg-amber-400/20 dark:text-amber-200">
                          {item.watchScore}分
                        </span>
                      )}
                      {item.recommendScore !== undefined && (
                        <span className="rounded bg-[#EBEBD8] px-2 py-0.5 text-[#455230] dark:bg-emerald-950/60 dark:text-emerald-300">
                          爆米花 {item.recommendScore}/10
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg border border-white/70 bg-white/30 dark:border-slate-700/60 dark:bg-slate-900/40">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={cardTitle}
                        fill
                        sizes="64px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-600">
                        <Film className="h-5 w-5 opacity-50" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 廣告版位 4：文章底部廣告 */}
      <AdSense slotType="article-bottom" />
    </AmbientPostLayout>
  );
}