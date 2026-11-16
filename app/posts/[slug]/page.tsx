import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPostsMeta, getPostBySlug, getPageBlocks } from "@/lib/notion";
import NotionRenderer from "@/components/NotionRenderer";
import AdSense from "@/components/AdSense";
import { formatDate, estimateReadingTime } from "@/lib/utils";
import { ArrowLeft, Calendar, Clock, Film, Tag } from "lucide-react";

// Vercel ISR: 增量靜態生成，每 60 秒在快取失效後重新在背景編譯
export const revalidate = 60;
export const dynamicParams = true;

// 從標題或文章前段內文區塊自動擷取 4 位數上映年份（優先比對括號內年份，避免誤抓劇情年代）
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

  // 1. 優先抓取括號內的年份，例如 (Tigertail, 2020) 或 (劇場版..., 2005)
  const parenYearMatch = introText.match(/[（(][^）)]*?((?:19|20)\d{2})[^）)]*?[）)]/);
  if (parenYearMatch) return parenYearMatch[1];

  // 2. 備援：抓取前段內文出現的四位數年份
  const generalYearMatch = introText.match(/(?:19|20)\d{2}/);
  return generalYearMatch ? generalYearMatch[0] : null;
}

// 建置時預先為最新 20 篇熱門文章建立靜態 HTML，其餘文章由 Vercel ISR 首次請求時動態生成並快取
export async function generateStaticParams() {
  const posts = await getAllPostsMeta();
  return posts.slice(0, 20).map((post) => ({
    slug: post.slug,
  }));
}

// 動態產生 SEO 與 Open Graph 標籤
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "文章不存在",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moviesdiary.vercel.app";
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

  // 取得文章所有 Notion Blocks（若首次回傳為空，短暫等待後再補抓一次確保非暫時性限流）
  let blocks = await getPageBlocks(post.id);
  if (blocks.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    blocks = await getPageBlocks(post.id);
  }

  const readingTime = estimateReadingTime(blocks);

  // 自動拆分「影評｜電影日記簿｜《片名》副標」結構，避免標題過長導致片名斷行
  const titleParts = post.title.split("｜").map((part) => part.trim()).filter(Boolean);
  const hasSeriesPrefix =
    titleParts.length >= 2 &&
    (titleParts[0].includes("影評") ||
      titleParts[0].includes("電影日記簿") ||
      titleParts[0].includes("影集說大話"));

  const seriesPrefix = hasSeriesPrefix ? titleParts.slice(0, -1).join(" ｜ ") : null;
  const cleanMainTitle = hasSeriesPrefix ? titleParts[titleParts.length - 1] : post.title;

  // 優先使用資料庫上映年份，若無則從標題或文章內文前段自動擷取
  const extractedYear = post.releaseYear || extractMovieYear(post.title, blocks);

  // Schema.org/Article JSON-LD 結構化資料
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moviesdiary.vercel.app";
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* 結構化資料注入 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 返回按鈕 */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回文章列表</span>
        </Link>
      </div>

      {/* 文章標頭資訊 */}
      <header className="mb-8 border-b border-slate-200/80 pb-8 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
          {post.category && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <Film className="h-3 w-3" />
              {post.category}
            </span>
          )}
          {extractedYear && (
            <>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
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

        {/* 優化後的主標題區塊（單行不換行，支援橫向滾動） */}
        <div className="space-y-2">
          {seriesPrefix && (
            <p className="text-sm font-semibold tracking-wider text-amber-600 dark:text-amber-400">
              {seriesPrefix}
            </p>
          )}
          <h1 className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap overflow-x-auto">
            {cleanMainTitle}
          </h1>
        </div>

        {/* 標籤 */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <Tag className="h-3 w-3 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 廣告版位 2：文章頁頂部廣告 (Top Banner Ad) */}
      <AdSense slotType="article-top" />

      {/* 核心文章內文渲染器 (內建 廣告版位 3：內文段落置中廣告 In-Article Ad) */}
      <main className="my-8">
        <NotionRenderer blocks={blocks} insertInArticleAd={true} />
      </main>

      {/* 廣告版位 4：文章底部廣告 (Bottom Banner Ad) */}
      <AdSense slotType="article-bottom" />
    </div>
  );
}