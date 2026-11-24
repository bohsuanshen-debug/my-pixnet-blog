"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";

interface CommentSectionProps {
  slug: string;
}

export default function CommentSection({ slug }: CommentSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState(false);

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO || "";
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "";
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "Announcements";
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "";

  const isConfigured = Boolean(repo && repoId && categoryId);

  // 偵測網站目前的明暗色模式，自動同步 Giscus 留言區佈景主題
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // 動態載入或更新 Giscus 留言框
  useEffect(() => {
    if (!isConfigured || !containerRef.current) return;

    const theme = isDark ? "transparent_dark" : "light";
    const existingIframe = containerRef.current.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );

    if (existingIframe) {
      existingIframe.contentWindow?.postMessage(
        { giscus: { setConfig: { theme } } },
        "https://giscus.app"
      );
      return;
    }

    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", slug);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", "zh-TW");
    script.setAttribute("data-loading", "lazy");

    containerRef.current.appendChild(script);
  }, [isConfigured, isDark, repo, repoId, category, categoryId, slug]);

  return (
    <section
      aria-label="讀者討論區"
      className="my-10 rounded-2xl border border-white/60 bg-white/35 p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/35"
    >
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-[#455230]/15 pb-3 dark:border-white/10">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[#455230] dark:text-amber-300 shrink-0">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <h2 className="text-[15px] sm:text-lg font-bold tracking-tight whitespace-nowrap">
            讀者討論區
          </h2>
        </div>
        <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">
          歡迎留言交流你對這部作品的看法！
        </span>
      </div>

      {isConfigured ? (
        <div ref={containerRef} className="giscus min-h-[150px]" />
      ) : (
        <div className="rounded-xl border border-dashed border-[#455230]/30 bg-white/40 p-5 text-center text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
          <p className="font-semibold text-[#455230] dark:text-amber-300">
            留言板功能已就緒，尚未填入 GitHub Giscus 環境變數
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            請於 Vercel 環境變數設定{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/10">
              NEXT_PUBLIC_GISCUS_REPO
            </code>
            、
            <code className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/10">
              NEXT_PUBLIC_GISCUS_REPO_ID
            </code>{" "}
            與{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/10">
              NEXT_PUBLIC_GISCUS_CATEGORY_ID
            </code>{" "}
            即可立即開啟留言。
          </p>
        </div>
      )}
    </section>
  );
}