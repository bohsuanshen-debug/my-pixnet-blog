import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getPostBySlug, getPageBlocks } from "@/lib/notion";
import NotionRenderer from "@/components/NotionRenderer";
import AdSense from "@/components/AdSense";
import { formatDate, estimateReadingTime } from "@/lib/utils";
import { ArrowLeft, Calendar, Clock, ExternalLink, Film, Tag } from "lucide-react";

// Vercel ISR: 增量靜態生成，每 60 秒在快取失效後重新在背景編譯
export const revalidate = 60;
export const dynamicParams = true;

// 建置時預先為最新 20 篇熱門文章建立靜態 HTML，其餘文章由 Vercel ISR 首次請求時動態生成並快取
export async function generateStaticParams() {
  const posts = await getAllPosts();
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
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

  // 取得文章所有 Notion Blocks
  const blocks = await getPageBlocks(post.id);
  const readingTime = estimateReadingTime(blocks);

  // Schema.org/Article JSON-LD 結構化資料
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
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

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
          {post.title}
        </h1>

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

      {/* 痞客邦原出處宣告 */}
      {post.originalUrl && (
        <aside className="mt-10 rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400 flex items-center justify-between">
          <span>本文最初發表於痞客邦部落格 (Pixnet)</span>
          <a
            href={post.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-600 hover:underline dark:text-amber-400"
          >
            <span>檢視原始文章</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </aside>
      )}
    </div>
  );
}
