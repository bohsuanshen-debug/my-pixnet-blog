import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts, getPostBySlug, getPageBlocks, type BlogPost, type NotionBlock } from "@/lib/notion";
import NotionRenderer from "@/components/NotionRenderer";
import AdSense from "@/components/AdSense";
import AmbientPostLayout from "@/components/AmbientPostLayout";
import ShareSection from "@/components/ShareSection";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar, Film, Sparkles } from "lucide-react";

// 快取 10 分鐘，減少不必要的背景 API 請求；一旦生成成功即長期穩定提供快取
export const revalidate = 600;
export const dynamicParams = true;

function extractCardTitle(title: string): string {
  const quoteMatch = title.match(/《([^》]+)》(.*)$/);
  return quoteMatch?.[1]?.trim() || title;
}

/**
 * 打造專屬社群分享標題格式：
 * 移除「影視戴爾瑞」與「超主觀評分」，保留《片名》+ 自訂副標題，爆米花指數接在最後
 * 例如：《異星入境》打破你的既定印象?! (爆米花指數 8.5/10)
 */
function formatSocialShareTitle(title: string, recommendScore?: number): string {
  const quoteMatch = title.match(/《([^》]+)》(.*)$/);
  let main = title;
  let sub = "";

  if (quoteMatch) {
    main = quoteMatch[1].trim();
    sub = quoteMatch[2].trim();
  } else {
    const parts = title.split(/[｜|]/);
    main = parts[parts.length - 1].trim();
  }

  const base = sub ? `《${main}》${sub}` : (main.startsWith("《") ? main : `《${main}》`);
  return typeof recommendScore === "number" ? `${base} (爆米花指數 ${recommendScore}/10)` : base;
}

/**
 * 從已讀取的 Notion 區塊中自動擷取前段真實文字作為 SEO description
 * 不增加任何額外 API 請求
 */
function extractSeoDescriptionFromBlocks(blocks: NotionBlock[], fallbackTitle: string, maxLen = 155): string {
  const textChunks: string[] = [];

  for (const block of blocks) {
    const richText =
      block[block.type]?.rich_text ||
      (block.type === "paragraph" ? block.paragraph?.rich_text : null);

    if (Array.isArray(richText) && richText.length > 0) {
      const plain = richText
        .map((t: any) => t?.plain_text || "")
        .join("")
        .replace(/\s+/g, " ")
        .trim();

      // 略過過短的小標題或純分隔線
      if (plain.length >= 12 && !plain.startsWith("http")) {
        textChunks.push(plain);
      }
    }

    if (textChunks.join(" ").length >= maxLen + 40) {
      break;
    }
  }

  const combined = textChunks.join(" ").trim();
  if (!combined) {
    return `${fallbackTitle} - 由沈伯（戴爾瑞）撰寫的深度影評與觀後心得。`;
  }

  if (combined.length <= maxLen) {
    return combined;
  }

  return `${combined.slice(0, maxLen - 1).trim()}…`;
}

function normalizeTitleForMatch(rawTitle: string): string {
  return rawTitle
    .toLowerCase()
    .replace(/[（(][^）)]*[）)]/g, "") // 移除 (S2)、(下) 等括號後綴
    .replace(/[\s：:｜|·・\-—_!！?？,，.。]/g, "")
    .trim();
}

/**
 * 計算兩片名之間「最長連續相同字數」
 * 門檻為 >= 3 個字才算有關聯，避免 2 字常見詞誤判
 */
function getLongestCommonSubstringLength(titleA: string, titleB: string): number {
  const normA = normalizeTitleForMatch(titleA);
  const normB = normalizeTitleForMatch(titleB);
  if (normA.length < 3 || normB.length < 3) return 0;

  let maxLen = 0;
  for (let i = 0; i < normA.length; i++) {
    for (let j = 0; j < normB.length; j++) {
      let k = 0;
      while (
        i + k < normA.length &&
        j + k < normB.length &&
        normA[i + k] === normB[j + k]
      ) {
        k += 1;
      }
      if (k > maxLen) {
        maxLen = k;
      }
    }
  }

  return maxLen >= 3 ? maxLen : 0;
}

function matchesManualTarget(candidate: BlogPost, target: string): boolean {
  const cleanTarget = target.trim().toLowerCase();
  if (!cleanTarget) return false;

  const cleanId = candidate.id.replace(/-/g, "").toLowerCase();
  const cleanSlug = candidate.slug.toLowerCase();
  const fullTitle = candidate.title.toLowerCase();
  const shortTitle = extractCardTitle(candidate.title).toLowerCase();
  const hasMatchingTag = (candidate.tags || []).some(
    (t) => t.trim().toLowerCase() === cleanTarget
  );

  return (
    cleanId === cleanTarget.replace(/-/g, "") ||
    cleanSlug === cleanTarget ||
    fullTitle.includes(cleanTarget) ||
    shortTitle.includes(cleanTarget) ||
    hasMatchingTag
  );
}

/**
 * 第 3 格（及第 2 格無 3 字以上片名關聯時的備援）挑選邏輯：
 * 相同標記（Tags）越多排越前面 → 手動推薦標記 → 片名 >= 3 字關聯 → 同分類 → 日期由新到舊
 */
function pickBestTagRelatedPost(
  currentPost: BlogPost,
  pool: BlogPost[],
  currentMainTitle: string
): BlogPost | undefined {
  if (pool.length === 0) return undefined;

  const manualTargets = currentPost.manualRecommendations || [];
  const currentTags = new Set(
    (currentPost.tags || []).map((t) => t.trim().toLowerCase()).filter(Boolean)
  );

  const scored = pool
    .map((p) => {
      const candidateUniqueTags = new Set(
        (p.tags || []).map((t) => t.trim().toLowerCase()).filter(Boolean)
      );
      let sharedTagsCount = 0;
      candidateUniqueTags.forEach((tag) => {
        if (currentTags.has(tag)) sharedTagsCount += 1;
      });

      const isManual = manualTargets.some((target) => matchesManualTarget(p, target)) ? 1 : 0;
      const commonTitleLen = getLongestCommonSubstringLength(
        currentMainTitle,
        extractCardTitle(p.title)
      );
      const sameCategory = currentPost.category && p.category === currentPost.category ? 1 : 0;
      const timeWeight = new Date(p.date).getTime() || 0;
      const isRelevant = sharedTagsCount > 0 || isManual > 0 || commonTitleLen >= 3;

      return {
        post: p,
        isRelevant,
        sharedTagsCount,
        isManual,
        commonTitleLen,
        sameCategory,
        timeWeight,
      };
    })
    .filter((item) => item.isRelevant)
    .sort((a, b) => {
      if (b.sharedTagsCount !== a.sharedTagsCount) {
        return b.sharedTagsCount - a.sharedTagsCount;
      }
      if (b.isManual !== a.isManual) {
        return b.isManual - a.isManual;
      }
      if (b.commonTitleLen !== a.commonTitleLen) {
        return b.commonTitleLen - a.commonTitleLen;
      }
      if (b.sameCategory !== a.sameCategory) {
        return b.sameCategory - a.sameCategory;
      }
      return b.timeWeight - a.timeWeight;
    });

  return scored[0]?.post || pool[0];
}

/**
 * 3 個推薦槽位：
 * 第 1 格：最新相同分類的文章
 * 第 2 格：片名連續 3 個字以上相同且共同字數最多的文章；若無則比照第 3 格機制
 * 第 3 格：相同標記（Tags）越多的文章（不足則補最新文章）
 */
function getRelatedPosts(currentPost: BlogPost, allPosts: BlogPost[]): BlogPost[] {
  const candidates = allPosts
    .filter((p) => p.id !== currentPost.id)
    .sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0));

  const pickedIds = new Set<string>();
  const result: BlogPost[] = [];

  // ── 第 1 格：最新相同分類的文章 ──
  const latestSameCategory = candidates.find(
    (p) => currentPost.category && p.category === currentPost.category
  );
  if (latestSameCategory) {
    result.push(latestSameCategory);
    pickedIds.add(latestSameCategory.id);
  } else if (candidates[0]) {
    result.push(candidates[0]);
    pickedIds.add(candidates[0].id);
  }

  // ── 第 2 格：片名連續 3 個字以上相同的文章（共同字數越多越前面）；若無則比照第 3 格 ──
  const currentMainTitle = extractCardTitle(currentPost.title);
  const slot2Pool = candidates.filter((p) => !pickedIds.has(p.id));
  const titleMatched = slot2Pool
    .map((p) => {
      const commonLen = getLongestCommonSubstringLength(
        currentMainTitle,
        extractCardTitle(p.title)
      );
      const sameCategory = currentPost.category && p.category === currentPost.category ? 1 : 0;
      const timeWeight = new Date(p.date).getTime() || 0;
      return { post: p, commonLen, sameCategory, timeWeight };
    })
    .filter((item) => item.commonLen >= 3)
    .sort((a, b) => {
      if (b.commonLen !== a.commonLen) return b.commonLen - a.commonLen;
      if (b.sameCategory !== a.sameCategory) return b.sameCategory - a.sameCategory;
      return b.timeWeight - a.timeWeight;
    });

  if (titleMatched[0]) {
    result.push(titleMatched[0].post);
    pickedIds.add(titleMatched[0].post.id);
  } else {
    const fallbackSlot2 = pickBestTagRelatedPost(currentPost, slot2Pool, currentMainTitle);
    if (fallbackSlot2) {
      result.push(fallbackSlot2);
      pickedIds.add(fallbackSlot2.id);
    }
  }

  // ── 第 3 格：相同標記（Tags）越多的文章 ──
  const slot3Pool = candidates.filter((p) => !pickedIds.has(p.id));
  const slot3Pick = pickBestTagRelatedPost(currentPost, slot3Pool, currentMainTitle);
  if (slot3Pick) {
    result.push(slot3Pick);
    pickedIds.add(slot3Pick.id);
  }

  return result.slice(0, 3);
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

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://bhmoviediary.com").replace(/\/$/, "");
    const postUrl = `${siteUrl}/posts/${post.slug}`;
    const pureWorkTitle = extractCardTitle(post.title);

    // 沿用 React cache() 快取的 blocks，不產生重複 Notion API 呼叫
    let dynamicDescription = post.excerpt || "";
    if (!dynamicDescription) {
      try {
        const blocks = await getPageBlocks(post.id);
        dynamicDescription = extractSeoDescriptionFromBlocks(blocks, pureWorkTitle);
      } catch {
        dynamicDescription = `《${pureWorkTitle}》無雷／有雷深度影評與觀後感，由戴爾瑞撰寫。`;
      }
    }

    const socialShareTitle = formatSocialShareTitle(post.title, post.recommendScore);

    return {
      title: post.title,
      description: dynamicDescription,
      keywords: [pureWorkTitle, `${pureWorkTitle} 影評`, `${pureWorkTitle} 心得`, ...(post.tags || []), "影視戴爾瑞"],
      alternates: {
        canonical: postUrl,
      },
      openGraph: {
        title: socialShareTitle,
        description: dynamicDescription,
        url: postUrl,
        type: "article",
        publishedTime: post.date,
        authors: ["戴爾瑞"],
        tags: post.tags,
        images: post.coverImage ? [{ url: post.coverImage, alt: `${pureWorkTitle} 海報封面` }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: socialShareTitle,
        description: dynamicDescription,
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
    recommendedPosts = getRelatedPosts(post, allPosts);
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
  const pureWorkTitle = extractCardTitle(post.title);
  const seoDescription = post.excerpt || extractSeoDescriptionFromBlocks(blocks, pureWorkTitle);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://bhmoviediary.com").replace(/\/$/, "");
  const postUrl = `${siteUrl}/posts/${post.slug}`;

  const isTvSeries =
    post.category?.includes("影集") ||
    post.title.includes("影集說大話") ||
    /\(S\d+/i.test(post.title);
  const isVideoGame =
    post.category?.includes("電玩") || post.title.includes("電玩");

  const reviewedItemType = isVideoGame
    ? "VideoGame"
    : isTvSeries
    ? "TVSeries"
    : "Movie";

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${postUrl}#article`,
        headline: post.title,
        description: seoDescription,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: "zh-TW",
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
            url: `${siteUrl}/logo.jpg`,
          },
        },
        image: post.coverImage || undefined,
      },
      {
        "@type": "Review",
        "@id": `${postUrl}#review`,
        name: post.title,
        reviewBody: seoDescription,
        datePublished: post.date,
        inLanguage: "zh-TW",
        author: {
          "@type": "Person",
          name: "戴爾瑞",
        },
        itemReviewed: {
          "@type": reviewedItemType,
          name: pureWorkTitle,
          ...(post.releaseYear ? { dateCreated: post.releaseYear } : {}),
          ...(post.coverImage ? { image: post.coverImage } : {}),
        },
        ...(post.watchScore !== undefined
          ? {
              reviewRating: {
                "@type": "Rating",
                ratingValue: post.watchScore,
                bestRating: 100,
                worstRating: 0,
              },
            }
          : {}),
      },
    ],
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

      {/* 社群快捷分享與推坑卡片模組 */}
      <ShareSection
        title={post.title}
        pureTitle={pureWorkTitle}
        url={postUrl}
        recommendScore={post.recommendScore}
        excerpt={seoDescription}
      />

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
                        alt={`${cardTitle} 海報封面`}
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