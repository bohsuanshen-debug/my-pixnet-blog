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
      className="my-10 rounded-2xl border border-white/60 bg-white/40 p-5 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/40"
    >
      <div className="mb-6 flex items-center justify-between border-b border-[#455230]/10 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-[#455230] dark:text-amber-300" />
          <h2 className="text-lg font-bold text-[#455230] dark:text-amber-300">
            讀者討論區
          </h2>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
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
