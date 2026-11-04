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
  const isDev = process.env.NODE_ENV === "development" || !clientId;

  useEffect(() => {
    // 僅在生產環境且有設定 Client ID 時執行 AdSense 推播
    if (!isDev) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense push error:", err);
      }
    }
  }, [isDev]);

  return (
    <div
      className={`my-8 w-full overflow-hidden rounded-xl bg-slate-50/70 p-3 text-center dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 ${config.minHeight} flex flex-col items-center justify-center transition-all ${className}`}
      aria-label="Advertisement"
    >
      {/* 標籤小提示 */}
      <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        贊助廣告 / Advertisement
      </span>

      {isDev ? (
        // 開發環境預覽佔位符 (防止累積版面位移 CLS)
        <div className="flex flex-col items-center justify-center py-4 text-xs text-slate-400 dark:text-slate-500">
          <div className="font-semibold text-slate-600 dark:text-slate-300">
            {config.label}
          </div>
          <div className="mt-1 font-mono text-[11px] opacity-80">
            Slot ID: {activeSlotId} | Format: {format}
          </div>
          <div className="mt-1 text-[10px] text-amber-600/90 dark:text-amber-400/90">
            (設定 NEXT_PUBLIC_ADSENSE_CLIENT_ID 後於正式環境自動呈現真實廣告)
          </div>
        </div>
      ) : (
        // 正式環境 AdSense 非同步程式碼
        <>
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={clientId}
            data-ad-slot={activeSlotId}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        </>
      )}
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
