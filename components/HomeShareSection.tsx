"use client";

import React, { useState } from "react";
import { Share2, Check, Copy, MessageCircle, Send } from "lucide-react";

export default function HomeShareSection() {
  const [copiedLink, setCopiedLink] = useState(false);

  const defaultTitle = "影視戴爾瑞 ｜ 電影與影集深度解析與心得評論";
  const defaultText = "【影視戴爾瑞】紀錄影視感動瞬間，電影、影集與電玩深度解析心得分享：";

  const getTargetUrl = () => {
    return typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://bhmoviediary.com";
  };

  // 1. 原生手機分享 (Web Share API)
  const handleNativeShare = async () => {
    const url = getTargetUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: defaultTitle,
          text: defaultText,
          url,
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }
    handleCopyLink();
  };

  // 2. 一鍵複製首頁連結
  const handleCopyLink = () => {
    const url = getTargetUrl();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  // 3. LINE 分享
  const shareToLine = () => {
    const url = getTargetUrl();
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(defaultTitle)}`;
    window.open(lineUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  // 4. Facebook 分享
  const shareToFacebook = () => {
    const url = getTargetUrl();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  // 5. Threads / X 分享
  const shareToThreadsOrX = () => {
    const url = getTargetUrl();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      defaultTitle
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  return (
    <section
      aria-label="分享影視戴爾瑞"
      className="mt-12 rounded-2xl border border-white/60 bg-white/35 p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/35"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="inline-flex items-center gap-2 text-base font-bold text-[#455230] dark:text-amber-300">
            <Share2 className="h-4 w-4" />
            <span>喜歡影視戴爾瑞？推薦給身邊的影迷朋友</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            一鍵分享本站給朋友，一起探索院線電影、影集與電玩的深度心得
          </p>
        </div>

        {/* 快捷操作按鈕群 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 原生分享按鈕 */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#455230] px-3.5 py-1.5 text-xs font-semibold text-[#EBEBD8] hover:bg-[#343e24] shadow-xs transition-all active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
            <span>分享網站</span>
          </button>

          {/* LINE */}
          <button
            type="button"
            onClick={shareToLine}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 transition-all active:scale-95"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>LINE</span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={shareToFacebook}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300 hover:bg-blue-500/20 transition-all active:scale-95"
          >
            <span>Facebook</span>
          </button>

          {/* Threads / X */}
          <button
            type="button"
            onClick={shareToThreadsOrX}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/20 bg-slate-900/10 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-900/20 transition-all active:scale-95"
          >
            <span>Threads / X</span>
          </button>

          {/* 一鍵複製首頁網址 */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#455230]/25 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#455230] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 hover:bg-white shadow-xs transition-all active:scale-95"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">已複製首頁連結！</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>複製網址</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
