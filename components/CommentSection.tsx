"use client";

import React from "react";
import Giscus from "@giscus/react";
import { MessageSquareText } from "lucide-react";

interface CommentSectionProps {
  slug: string;
}

export default function CommentSection({ slug }: CommentSectionProps) {
  const repo = "bohsuanshen-debug/my-pixnet-blog";
  const repoId = "R_kgDOViXzhQ";
  const category = "General";
  const categoryId = "DIC_kwDOViXzhc4DL1Xp";

  return (
    <section
      id="comments"
      aria-label="讀者討論區"
      className="my-10 rounded-2xl border border-white/60 bg-white/40 p-4 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/40"
    >
      <div className="mb-6 flex items-center justify-between gap-2 border-b border-[#455230]/10 dark:border-white/10 pb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <MessageSquareText className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[#455230] dark:text-amber-300" />
          <h2 className="text-[15px] sm:text-lg font-bold text-[#455230] dark:text-amber-300 whitespace-nowrap">
            讀者討論區
          </h2>
        </div>
        <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
          歡迎留言交流你對這部作品的看法！
        </span>
      </div>

      <div className="min-h-[160px]">
        <Giscus
          id="comments-thread"
          repo={repo}
          repoId={repoId}
          category={category}
          categoryId={categoryId}
          mapping="pathname"
          term={slug}
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme="preferred_color_scheme"
          lang="zh-TW"
          loading="lazy"
        />
      </div>
    </section>
  );
}