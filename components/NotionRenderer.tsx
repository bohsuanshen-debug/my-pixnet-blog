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
 * 將純文字中的 FB / IG 社群推廣段落精準拆分，各自注入對應的 Facebook 與 Instagram 超連結
 */
function renderTextWithSocialLinks(rawText: string): React.ReactNode {
  // 同時支援「同一段落內換行」或「單獨一行」的 FB / IG 推廣句
  const tokenRegex =
    /((?:喜歡的朋友[^\n]*?【影視戴爾瑞】[^\n]*)|(?:更多影視[^\n]*?【影視戴爾瑞】[^\n]*))/g;

  const segments = rawText.split(tokenRegex);
  if (segments.length === 1) return rawText;

  return segments.map((seg, i) => {
    if (!seg) return null;

    if (
      seg.includes("【影視戴爾瑞】") &&
      (seg.includes("FB") || seg.includes("Facebook") || seg.includes("一個讚"))
    ) {
      const [before, ...after] = seg.split("【影視戴爾瑞】");
      return (
        <React.Fragment key={i}>
          {before}
          <a
            href="https://www.facebook.com/bohsuanmoviediary"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 underline underline-offset-4 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            【影視戴爾瑞】
          </a>
          {after.join("【影視戴爾瑞】")}
        </React.Fragment>
      );
    }

    if (
      seg.includes("【影視戴爾瑞】") &&
      (seg.includes("IG") ||
        seg.includes("Instagram") ||
        seg.includes("Instargram"))
    ) {
      const [before, ...after] = seg.split("【影視戴爾瑞】");
      return (
        <React.Fragment key={i}>
          {before}
          <a
            href="https://www.instagram.com/bh_moviediary"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-pink-600 underline underline-offset-4 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
          >
            【影視戴爾瑞】
          </a>
          {after.join("【影視戴爾瑞】")}
        </React.Fragment>
      );
    }

    return <React.Fragment key={i}>{seg}</React.Fragment>;
  });
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

        // 若無自訂連結，自動解析同段落內的 FB 與 IG 社群連結
        if (!href && typeof content === "string") {
          content = renderTextWithSocialLinks(content);
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
                className="text-amber-600 underline underline-offset-4 hover:text-amber-700 dark:text-amber-400