import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts, getPostBySlug, getPageBlocks } from "@/lib/notion";
import NotionRenderer from "@/components/NotionRenderer";
import AdSense from "@/components/AdSense";
import AmbientPostLayout from "@/components/AmbientPostLayout";
import { formatDate, estimateReadingTime } from "@/lib/utils";
import { ArrowLeft, Calendar, Clock, Film, Tag } from "lucide-react";

// 快取 10 分鐘，減少不必要的背景 API 請求；一旦生成成功即長期穩定提供快取
export const revalidate = 600;
export const dynamicParams = true;

function extractMovieYear(title: string, blocks: unknown[]): string | null {
  const titleMatch = title.match(/(?:19|20)\d{2}/);
  if (titleMatch) return titleMatch[0];

  const firstBlocks = Array.isArray(blocks) ? blocks.slice(0, 8) : [];
  const texts: string[] = [];

  const collectText = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (typeof record.plain_text === "string") {
      texts.push(record.plain_text);
      return;
    }
    if (typeof record.text === "string") {
      texts.push(record.text);
      return;
    }
    for (const value of Object.values(record)) {
      if (Array.isArray(value)) {
        value.forEach(collectText);
      } else if (value && typeof value === "object") {
        collectText(value);
      }
    }
  };

  firstBlocks.forEach(collectText);
  const introText = texts.join(" ");

  const parenYearMatch = introText.match(/[（(][^）)]*?((?:19|20)\d{2})[^）)]*?[）)]/);
  if (parenYearMatch) return parenYearMatch[1];

  const generalYearMatch = introText.match(/(?:19|20)\d{2}/);
  return generalYearMatch ? generalYearMatch[0] : null;
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
  try {
    const allPosts = await getAllPosts();
    relatedPostLinks = allPosts
      .filter((p) => p.id !== post.id)
      .map((p) => ({ slug: p.slug, title: p.title }));
  } catch {
    // 延伸閱讀配對為非核心功能，失敗時靜默略過不影響主內文顯示
  }

  const readingTime = estimateReadingTime(blocks);

  const titleParts = post.title.split("｜").map((part) => part.trim()).filter(Boolean);
  const hasSeriesPrefix =
    titleParts.length >= 2 &&
    (titleParts[0].includes("影評") ||
      titleParts[0].includes("電影日記簿") ||
      titleParts[0].includes("影集說大話"));

  const seriesPrefix = hasSeriesPrefix ? titleParts.slice(0, -1).join(" ｜ ") : null;
  const cleanMainTitle = hasSeriesPrefix ? titleParts[titleParts.length - 1] : post.title;

  const extractedYear = post.releaseYear || extractMovieYear(post.title, blocks);

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

      {/* 文章標頭資訊 + 直式封面海報 */}
      <header className="mb-8 border-b border-neutral-200/80 pb-8 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          {/* 左側：分類、日期、標題、評分與標籤 */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 mb-4 font-medium">
              {post.category && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                  <Film className="h-3 w-3" />
                  {post.category}
                </span>
              )}
              {extractedYear && (
                <>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    ({extractedYear})
                  </span>
                  <span>•</span>
                </>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                約 {readingTime} 分鐘閱讀
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

            {/* 標籤 */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    <Tag className="h-3 w-3 opacity-60" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 右側：電影／影集直式封面海報 */}
          {post.coverImage && (
            <div className="relative mx-auto sm:mx-0 h-56 w-40 sm:h-60 sm:w-42 shrink-0 overflow-hidden rounded-2xl border border-white/60 bg-neutral-100 shadow-md dark:border-neutral-700/60 dark:bg-neutral-800">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 160px, 168px"
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
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

      {/* 廣告版位 4：文章底部廣告 */}
      <AdSense slotType="article-bottom" />
    </AmbientPostLayout>
  );
}