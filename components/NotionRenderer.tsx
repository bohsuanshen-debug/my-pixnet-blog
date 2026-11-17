"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NotionBlock, NotionRichText } from "@/lib/notion";
import AdSense from "./AdSense";
import { Check, Copy, ArrowUpRight } from "lucide-react";

export interface RelatedPostLink {
  slug: string;
  title: string;
}

interface NotionRendererProps {
  blocks: NotionBlock[];
  insertInArticleAd?: boolean;
  allPosts?: RelatedPostLink[];
}

/**
 * 將痞客邦舊網址轉換為本站站內路徑（例如 https://.../blog/posts/12345 -> /posts/12345）
 */
function normalizeHref(href: string): { url: string; isInternal: boolean } {
  const pixnetMatch = href.match(/pixnet\.net\/blog\/posts?\/(\d+)/);
  if (pixnetMatch && pixnetMatch[1]) {
    return { url: `/posts/${pixnetMatch[1]}`, isInternal: true };
  }
  if (href.startsWith("/")) {
    return { url: href, isInternal: true };
  }
  return { url: href, isInternal: false };
}

/**
 * 渲染 Rich Text 富文本節點 (支援粗體、斜體、刪除線、底線、內聯程式碼、超連結、以及社群關鍵字自動轉連結)
 */
export function RenderRichText({ richText }: { richText: NotionRichText[] }) {
  if (!richText || richText.length === 0) return null;

  return (
    <>
      {richText.map((item, idx) => {
        const { text, annotations, href } = item;
        if (!text) return null;

        let content: React.ReactNode = text.content;

        // 若無自訂連結，自動比對 FB / IG 社群呼籲關鍵字並注入對應連結
        if (!href && typeof content === "string") {
          const raw = content;
          if (
            (raw.includes("FB") || raw.includes("Facebook")) &&
            (raw.includes("影視戴爾瑞") || raw.includes("一個讚"))
          ) {
            const parts = raw.split("【影視戴爾瑞】");
            if (parts.length > 1) {
              content = (
                <>
                  {parts[0]}
                  <a
                    href="https://www.facebook.com/bohsuanmoviediary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 underline underline-offset-4 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    【影視戴爾瑞】
                  </a>
                  {parts.slice(1).join("【影視戴爾瑞】")}
                </>
              );
            }
          } else if (
            (raw.includes("IG") ||
              raw.includes("Instagram") ||
              raw.includes("Instargram")) &&
            raw.includes("影視戴爾瑞")
          ) {
            const parts = raw.split("【影視戴爾瑞】");
            if (parts.length > 1) {
              content = (
                <>
                  {parts[0]}
                  <a
                    href="https://www.instagram.com/bh_moviediary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-pink-600 underline underline-offset-4 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
                  >
                    【影視戴爾瑞】
                  </a>
                  {parts.slice(1).join("【影視戴爾瑞】")}
                </>
              );
            }
          }
        }

        if (annotations?.bold) {
          content = <strong key={`b-${idx}`}>{content}</strong>;
        }
        if (annotations?.italic) {
          content = <em key={`i-${idx}`}>{content}</em>;
        }
        if (annotations?.strikethrough) {
          content = <s key={`s-${idx}`}>{content}</s>;
        }
        if (annotations?.underline) {
          content = <u key={`u-${idx}`}>{content}</u>;
        }
        if (annotations?.code) {
          content = (
            <code
              key={`c-${idx}`}
              className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-pink-600 dark:bg-slate-800 dark:text-pink-400"
            >
              {content}
            </code>
          );
        }

        if (href) {
          const { url, isInternal } = normalizeHref(href);
          if (isInternal) {
            content = (
              <Link
                key={`a-${idx}`}
                href={url}
                className="text-amber-600 underline underline-offset-4 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
              >
                {content}
              </Link>
            );
          } else {
            content = (
              <a
                key={`a-${idx}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 underline underline-offset-4 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
              >
                {content}
              </a>
            );
          }
        }

        return <React.Fragment key={idx}>{content}</React.Fragment>;
      })}
    </>
  );
}

/**
 * 自動比對「｜影集說大話｜《片名》...」或「影評｜電影日記簿｜《片名》...」純文字延伸閱讀，匹配站內文章連結
 */
function findMatchedRelatedPost(
  plainText: string,
  allPosts?: RelatedPostLink[]
): RelatedPostLink | null {
  if (!allPosts || allPosts.length === 0) return null;

  const trimmed = plainText.trim();
  const isRecommendationLine =
    trimmed.startsWith("｜") ||
    trimmed.startsWith("|") ||
    trimmed.startsWith("影評｜") ||
    trimmed.startsWith("影集說大話") ||
    trimmed.startsWith("電影日記簿");

  if (!isRecommendationLine) return null;

  // 1. 優先提取《片名》做精準比對
  const workMatch = trimmed.match(/《([^》]+)》/);
  if (workMatch && workMatch[1]) {
    const workName = workMatch[1].trim();
    const byWork = allPosts.find((p) => p.title.includes(`《${workName}》`));
    if (byWork) return byWork;
  }

  // 2. 備援：比對移除「影評」前綴後的標題關鍵字串
  const cleanTarget = trimmed.replace(/^影評\s*[｜|]\s*/, "").trim();
  if (cleanTarget.length >= 6) {
    const byTitle = allPosts.find(
      (p) => p.title.includes(cleanTarget) || cleanTarget.includes(p.title)
    );
    if (byTitle) return byTitle;
  }

  return null;
}

/**
 * 程式碼區塊元件 (附帶一鍵複製功能)
 */
function CodeBlock({ block }: { block: any }) {
  const [copied, setCopied] = useState(false);
  const code = block.code?.rich_text?.[0]?.plain_text || "";
  const language = block.code?.language || "text";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 overflow-hidden rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm">
      <div className="flex items-center justify-between bg-slate-800/80 px-4 py-2 text-xs text-slate-400 border-b border-slate-700/60">
        <span className="uppercase tracking-wide">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded bg-slate-700 px-2 py-1 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span>已複製</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>複製</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * 圖片區塊元件 (高畫質自適應呈現、不強制過度放大、圓角與微陰影)
 */
function ImageBlock({ block }: { block: any }) {
  const image = block.image;
  let src = "";
  if (image?.type === "external") {
    src = image.external?.url || "";
  } else if (image?.type === "file") {
    src = image.file?.url || "";
  }

  const caption = image?.caption?.[0]?.plain_text || "";

  if (!src) return null;

  return (
    <figure className="my-8 flex flex-col items-center">
      <div className="relative max-w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1 sm:p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <img
          src={src}
          alt={caption || "文章插圖"}
          loading="lazy"
          className="max-h-[540px] w-auto max-w-full rounded-xl object-contain mx-auto transition-transform duration-300 hover:scale-[1.008]"
        />
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-center text-xs text-slate-500 dark:text-slate-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function NotionRenderer({
  blocks,
  insertInArticleAd = true,
  allPosts = [],
}: NotionRendererProps) {
  if (!blocks || blocks.length === 0) {
    return <p className="text-slate-500">此文章尚無內文。</p>;
  }

  const targetAdIndex = Math.min(
    Math.max(3, Math.floor(blocks.length * 0.35)),
    blocks.length - 2
  );

  const renderedElements: React.ReactNode[] = [];

  let listBuffer: {
    type: "bulleted_list_item" | "numbered_list_item";
    items: any[];
  } | null = null;

  const flushListBuffer = () => {
    if (!listBuffer) return;
    const ListTag = listBuffer.type === "bulleted_list_item" ? "ul" : "ol";
    const listClass =
      listBuffer.type === "bulleted_list_item"
        ? "list-disc list-outside pl-6 my-4 space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed"
        : "list-decimal list-outside pl-6 my-4 space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed";

    renderedElements.push(
      <ListTag key={`list-${renderedElements.length}`} className={listClass}>
        {listBuffer.items.map((item, i) => (
          <li key={i}>
            <RenderRichText richText={item[item.type]?.rich_text} />
          </li>
        ))}
      </ListTag>
    );
    listBuffer = null;
  };

  blocks.forEach((block, idx) => {
    const type = block.type;

    if (type === "bulleted_list_item" || type === "numbered_list_item") {
      if (!listBuffer || listBuffer.type !== type) {
        flushListBuffer();
        listBuffer = { type, items: [block] };
      } else {
        listBuffer.items.push(block);
      }
      return;
    } else {
      flushListBuffer();
    }

    if (insertInArticleAd && idx === targetAdIndex) {
      renderedElements.push(
        <AdSense key="in-article-ad-slot" slotType="in-content" />
      );
    }

    switch (type) {
      case "paragraph": {
        const richText = block.paragraph?.rich_text;
        if (!richText || richText.length === 0) {
          renderedElements.push(<div key={block.id} className="h-4" />);
          return;
        }

        const plainText = richText
          .map((r: NotionRichText) => r.text?.content || "")
          .join("");
        const hasExistingLink = richText.some((r: NotionRichText) =>
          Boolean(r.href || r.text?.link?.url)
        );

        // 若該段落尚未包含超連結，自動偵測是否為站內延伸閱讀標題並轉為可點擊連結
        if (!hasExistingLink) {
          const matchedPost = findMatchedRelatedPost(plainText, allPosts);
          if (matchedPost) {
            renderedElements.push(
              <p key={block.id} className="my-3">
                <Link
                  href={`/posts/${matchedPost.slug}`}
                  className="inline-flex items-center gap-1 font-medium text-amber-700 underline decoration-amber-400/70 underline-offset-4 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                >
                  <span>{plainText.trim()}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 opacity-75" />
                </Link>
              </p>
            );
            break;
          }
        }

        renderedElements.push(
          <p
            key={block.id}
            className="my-5 text-[17px] leading-[1.85] text-slate-700 dark:text-slate-300"
          >
            <RenderRichText richText={richText} />
          </p>
        );
        break;
      }

      case "heading_1":
      case "heading_2": {
        const richText = block[type]?.rich_text;
        const text = richText?.[0]?.plain_text || "";
        renderedElements.push(
          <h2
            key={block.id}
            id={encodeURIComponent(text)}
            className="mt-12 mb-5 font-serif text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2"
          >
            <RenderRichText richText={richText} />
          </h2>
        );
        break;
      }

      case "heading_3": {
        const richText = block.heading_3?.rich_text;
        const text = richText?.[0]?.plain_text || "";
        renderedElements.push(
          <h3
            key={block.id}
            id={encodeURIComponent(text)}
            className="mt-8 mb-4 font-serif text-xl md:text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-200"
          >
            <RenderRichText richText={richText} />
          </h3>
        );
        break;
      }

      case "quote": {
        renderedElements.push(
          <blockquote
            key={block.id}
            className="my-6 border-l-4 border-amber-500 bg-amber-50/40 p-4 rounded-r-xl italic text-slate-700 dark:bg-amber-950/20 dark:border-amber-400 dark:text-slate-300 font-serif"
          >
            <RenderRichText richText={block.quote?.rich_text} />
          </blockquote>
        );
        break;
      }

      case "code": {
        renderedElements.push(<CodeBlock key={block.id} block={block} />);
        break;
      }

      case "image": {
        renderedElements.push(<ImageBlock key={block.id} block={block} />);
        break;
      }

      case "divider": {
        renderedElements.push(
          <hr
            key={block.id}
            className="my-10 border-slate-200 dark:border-slate-800"
          />
        );
        break;
      }

      case "callout": {
        const icon = block.callout?.icon?.emoji || "💡";
        renderedElements.push(
          <div
            key={block.id}
            className="my-6 flex gap-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
          >
            <span className="text-xl select-none">{icon}</span>
            <div className="flex-1 leading-relaxed">
              <RenderRichText richText={block.callout?.rich_text} />
            </div>
          </div>
        );
        break;
      }

      default:
        break;
    }
  });

  flushListBuffer();

  return <article className="prose-content">{renderedElements}</article>;
}