import React from "react";
import type { Metadata } from "next";
import { Mail, MessageSquare, Share2, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "聯絡我們 (Contact Us)",
  description: "影視戴爾瑞合作洽詢、影評邀稿、版權問題與讀者反饋管道。",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center sm:text-left border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300 mb-3">
          <MessageSquare className="h-4 w-4" />
          <span>溝通與合作管道</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          聯絡我們 (Contact Us)
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
          無論是試映會邀請、影視邀稿專欄、品牌推廣合作，或是對網站有任何建議，歡迎隨時與我們聯繫。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* 社群聯絡 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                社群私訊（推薦，回覆最快）
              </h2>
              <p className="text-xs text-slate-500">平常即時接收訊息</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            您可以直接前往我們的 Facebook 粉絲專頁或 Instagram 帳號發送私訊，我們通常會在 24 小時內回覆。
          </p>
          <div className="flex flex-col gap-2.5">
            <a
              href="https://www.facebook.com/bohsuanmoviediary"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Facebook 專頁：影視戴爾瑞</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">前往 ↗</span>
            </a>
            <a
              href="https://www.instagram.com/bh_moviediary"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Instagram：@bh_moviediary</span>
              <span className="text-xs text-pink-600 dark:text-pink-400 font-semibold">前往 ↗</span>
            </a>
          </div>
        </div>

        {/* 電子郵件 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                電子郵件聯絡
              </h2>
              <p className="text-xs text-slate-500">商務邀約與版權相關</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            若有正式公關發稿、電影首映票務合作或版權相關問題，歡迎透過電子信箱來信溝通。
          </p>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="text-xs text-slate-400 mb-1">官方聯絡 Email</div>
            <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 select-all">
              bohsuanshen@gmail.com
            </div>
          </div>
        </div>
      </div>

      {/* 補充注意事項 */}
      <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 p-5 text-amber-800 dark:text-amber-300 text-sm">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold mb-1">版權與引用規範</div>
          本網站所有影評文章均為「影視戴爾瑞」原創撰寫。歡迎一般讀者自由分享網址連結；如需進行全文或部分段落轉載，請務必事先取得本站授權並註明出處與原文連結。
        </div>
      </div>
    </div>
  );
}
