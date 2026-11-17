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

function renderTextWithSocialLinks(rawText: string): React.ReactNode {
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

export function RenderRichText({ richText }: { richText: NotionRichText[] }) {
  if (!richText || richText.length === 0) return null;

  return (
    <>
      {richText.map((item, idx) => {
        const { text, annotations, href } = item;
        if (!text) return null;

        let content: React.ReactNode = text.content;

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
                className="text-amber-600 underline underline-offset-4 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
              >
                {content}