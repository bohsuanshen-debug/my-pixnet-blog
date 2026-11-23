"use client";

import React, { useState } from "react";
import { Share2, Check, Copy, MessageCircle, Send, Sparkles } from "lucide-react";

interface ShareSectionProps {
  title: string;
  pureTitle: string;
  url: string;
  watchScore?: number;
  recommendScore?: number;
  excerpt?: string;
}

export default function ShareSection({
  title,
  pureTitle,
  url,
  watchScore,
  recommendScore,
  excerpt,
}: ShareSectionProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // 打造有片名、雙評分特色的推坑金句文案
  const ratingsText = [
    watchScore !== undefined ? `超主觀評分：${watchScore}/100` : null,
    recommendScore !== undefined ? `爆米花指數：${recommendScore}/10` : null,
  ]
    .filter(Boolean)
    .join(" ｜ ");

  const shareText = `【影評分享】《${pureTitle}》\n${ratingsText ? `${ratingsText}\n` : ""}${
    excerpt ? `「${excerpt.slice(0, 70)}...」\n` : ""
  }閱讀全文：${url}`;

  // 1. 原生手機分享面板 (Web Share API)
  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `《${pureTitle}》- 影視戴爾瑞`,
          text: ratingsText ? `《${pureTitle}》${ratingsText}` : title,
          url,
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }
    handleCopyLink();
  };

  // 2. 一鍵複製連結
  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  // 3. 一鍵複製推坑金句卡文案
  const handleCopyQuote = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2200);
    }
  };

  // 社群快速分享跳轉
  const shareToLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(
      `【影視戴爾瑞】《${pureTitle}》${ratingsText ? ` (${ratingsText})` : ""}`
    )}`;
    window.open(lineUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const shareToThreadsOrX = () => {
    const tweetText = `《${pureTitle}》深度影評心得分享 ${ratingsText ? `[${ratingsText}]` : ""}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  return (
    <section
      aria-label="社群分享與推薦卡片"
      className="my-8 rounded-2xl border border-white/60 bg-white/40 p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/40"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#455230]/10 dark:border-white/10 pb-4">
        <div>
          <h3 className="inline-flex items-center gap-2 text-base font-bold text-[#455230] dark:text-amber-300">
            <Share2 className="h-4 w-4" />
            <span>喜歡這篇心得？分享給好友</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            低摩擦分享至 LINE、社群或聊天室，自帶片名與評分資訊
          </p>
        </div>

        {/* 手機原生分享（若支援） */}
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#455230] px-3.5 py-2 text-xs font-semibold text-[#EBEBD8] hover:bg-[#343e24] shadow-sm transition-all active:scale-95 sm:self-center"
        >
          <Send className="h-3.5 w-3.5" />
          <span>呼叫系統分享</span>
        </button>
      </div>

      {/* 快捷分享按鈕群 */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {/* LINE */}
        <button
          type="button"
          onClick={shareToLine}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 transition-all active:scale-95"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>LINE</span>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={shareToFacebook}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300 hover:bg-blue-500/20 transition-all active:scale-95"
        >
          <span>Facebook</span>
        </button>

        {/* Threads / X */}
        <button
          type="button"
          onClick={shareToThreadsOrX}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/20 bg-slate-900/10 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-900/20 transition-all active:scale-95"
        >
          <span>Threads / X</span>
        </button>

        {/* 一鍵複製連結 */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#455230]/25 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#455230] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 hover:bg-white shadow-xs transition-all active:scale-95"
        >
          {copiedLink ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">已複製連結！</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>複製文章連結</span>
            </>
          )}
        </button>

        {/* 一鍵複製推坑小卡文案 */}
        <button
          type="button"
          onClick={handleCopyQuote}
          title="複製包含片名、評分與連結的完整文案"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#637545]/30 bg-[#EBEBD8]/90 px-3 py-1.5 text-xs font-semibold text-[#455230] hover:bg-[#EBEBD8] shadow-xs transition-all active:scale-95"
        >
          {copiedQuote ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">已複製推坑文案！</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-[#637545]" />
              <span>複製推坑小卡文案</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
