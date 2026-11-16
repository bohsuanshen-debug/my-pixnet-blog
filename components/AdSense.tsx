"use client";

import React, { useEffect } from "react";
import Script from "next/script";

export type AdSlotType = "in-feed" | "article-top" | "in-content" | "article-bottom";

interface AdSenseProps {
  slotType: AdSlotType;
  slotId?: string;
  className?: string;
  format?: "auto" | "fluid" | "rectangle";
  responsive?: boolean;
}

const SLOT_CONFIG: Record<
  AdSlotType,
  { label: string; minHeight: string; defaultSlotId: string }
> = {
  "in-feed": {
    label: "廣告版位 1：首頁文章清單流 (In-Feed Ad)",
    minHeight: "min-h-[120px] md:min-h-[140px]",
    defaultSlotId: "1234567890",
  },
  "article-top": {
    label: "廣告版位 2：文章頂部版位 (Top Banner Ad)",
    minHeight: "min-h-[90px] md:min-h-[100px]",
    defaultSlotId: "2345678901",
  },
  "in-content": {
    label: "廣告版位 3：內文段落置中版位 (In-Article Ad)",
    minHeight: "min-h-[250px] md:min-h-[280px]",
    defaultSlotId: "3456789012",
  },
  "article-bottom": {
    label: "廣告版位 4：文章底端版位 (Bottom Banner Ad)",
    minHeight: "min-h-[250px] md:min-h-[280px]",
    defaultSlotId: "4567890123",
  },
};

export default function AdSense({
  slotType,
  slotId,
  className = "",
  format = "auto",
  responsive = true,
}: AdSenseProps) {
  const config = SLOT_CONFIG[slotType];
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";
  const activeSlotId = slotId || config.defaultSlotId;
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    // 僅在生產環境且有設定真實 Client ID 時執行 AdSense 推播
    if (!isDev && clientId) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense push error:", err);
      }
    }
  }, [isDev, clientId]);

  // 審核期間關鍵：若無設定 Client ID，在生產環境完全不渲染空框，避免被 Google 判定空白頁面或垃圾內容
  if (!clientId && !isDev) {
    return null;
  }

  if (isDev && !clientId) {
    return null; // 開發環境亦不渲染佔位虛框，保證預覽純淨
  }

  return (
    <div
      className={`my-8 w-full overflow-hidden rounded-xl bg-slate-50/70 p-3 text-center dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 ${config.minHeight} flex flex-col items-center justify-center transition-all ${className}`}
      aria-label="Advertisement"
    >
      <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        贊助廣告 / Advertisement
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={activeSlotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

/**
 * 全域 AdSense Script 元件 (掛載於 Root Layout)
 */
export function AdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!clientId) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload" // 採用 lazyOnload 確保不搶佔首屏 Core Web Vitals 資源
    />
  );
}
