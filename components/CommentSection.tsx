"use client";

import React from "react";
import Giscus from "@giscus/react";
import { MessageSquareText } from "lucide-react";

interface CommentSectionProps {
  slug: string;
}

export default function CommentSection({ slug }: CommentSectionProps) {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO || "bohsuanshen-debug/my-pixnet-blog";
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "";
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "Announcements";
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "";

  return (
    <section
      id="comments"
      aria-label="讀者討論區"
      className="my-10 rounded-2xl border border-white/60 bg-white/40 p-5 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/40"
    >
      <div className="mb-6 flex items-center gap-2 border-b border-[#455230]/10 dark:border-white/10 pb-4">
        <MessageSquareText className="h-5 w-5 text-[#455230] dark:text-amber-300" />
        <h2 className="text-lg font-bold text-[#455230] dark:text-amber-300">
          讀者討論區
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          歡迎留言交流你對這部作品的看法！
        </span>
      </div>

      {repoId && categoryId ? (
        <Giscus
          id="comments"
          repo={repo as `${string}/${string}`}
          repoId={repoId}
          category={category}
          categoryId={categoryId}
          mapping="pathname"
          term={slug}
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme="preferred_color_scheme"
          lang="zh-TW"
          loading="lazy"
        />
      ) : (
        <Giscus
          id="comments"
          repo="bohsuanshen-debug/my-pixnet-blog"
          repoId={repoId}
          category="Announcements"
          categoryId={categoryId}
          mapping="pathname"
          term={slug}
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme="preferred_color_scheme"
          lang="zh-TW"
          loading="lazy"
        />
      )}
    </section>
  );
}
