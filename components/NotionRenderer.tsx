"use client";

import React, { useState } from "react";
import Image from "next/image";
import { NotionBlock, NotionRichText } from "@/lib/notion";
import AdSense from "./AdSense";
import { Check, Copy } from "lucide-react";

interface NotionRendererProps {
  blocks: NotionBlock[];
  insertInArticleAd?: boolean;
}

/**
 * 渲染 Rich Text 富文本節點 (支援粗體、斜體、刪除線、底線、內聯程式碼、超連結)
 */
export function RenderRichText({ richText }: { richText: NotionRichText[] }) {
  if (!richText || richText.length === 0) return null;

  return (
    <>
      {richText.map((item, idx) => {
        const { text, annotations, href } = item;
        if (!text) return null;

        let content: React.ReactNode = text.content;

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
          content = (
            <a
              key={`a-${idx}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 underline underline-offset-4 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
            >
              {content}
            </a>
          );
        }

        return <React.Fragment key={idx}>{content}</React.Fragment>;
      })}
    </>
  );
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
 * 圖片區塊元件 (使用 Next.js <Image/> 實作 WebP 轉檔、動態大小與 Lazy Loading)
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
    <figure className="my-8 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="relative h-[260px] sm:h-[380px] md:h-[500px] w-full overflow-hidden">
        <Image
          src={src}
          alt={caption || "文章插圖"}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-contain transition-transform duration-300 hover:scale-[1.01]"
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="p-3 text-center text-xs text-slate-500 dark:text-slate-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function NotionRenderer({
  blocks,
  insertInArticleAd = true,
}: NotionRendererProps) {
  if (!blocks || blocks.length === 0) {
    return <p className="text-slate-500">此文章尚無內文。</p>;
  }

  // 計算適合插入「內文廣告」的位置（大約在段落第 3 或 4 節處，或全文 35% 處）
  let paragraphCount = 0;
  const targetAdIndex = Math.min(
    Math.max(3, Math.floor(blocks.length * 0.35)),
    blocks.length - 2
  );

  const renderedElements: React.ReactNode[] = [];

  // 清單分組緩衝區
  let listBuffer: { type: "bulleted_list_item" | "numbered_list_item"; items: any[] } | null = null;

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

    // 清單群組聚合處理
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

    // 檢查是否需要插入內文廣告
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
        paragraphCount++;
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
        // 若為未支援的特殊 block，跳過或純文字呈現
        break;
    }
  });

  // 收尾殘餘清單
  flushListBuffer();

  return <article className="prose-content">{renderedElements}</article>;
}
