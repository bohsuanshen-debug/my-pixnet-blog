import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "隱私權政策 (Privacy Policy)",
  description: "影視戴爾瑞網站之隱私權保護政策、Cookie 使用與第三方廣告合作條款說明。",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center sm:text-left border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300 mb-3">
          <ShieldCheck className="h-4 w-4" />
          <span>法律與個資合規條款</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          隱私權政策 (Privacy Policy)
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          最後更新日期：2026 年 11 月 16 日
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-base leading-relaxed text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            <Lock className="h-5 w-5 text-amber-500" />
            1. 隱私權保護政策的適用範圍
          </h2>
          <p>
            歡迎造訪「影視戴爾瑞」（以下簡稱本網站）。本隱私權政策旨在說明當您造訪、瀏覽及使用本網站所提供之影視心得、文章評論及相關服務時，我們如何收集、處理、利用您的個人資訊與非個人化資訊，並保障您的合法權益。
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            <Eye className="h-5 w-5 text-amber-500" />
            2. 資料之蒐集與使用方式
          </h2>
          <p>
            本網站主要為部落格資訊分享型態，您無需註冊會員即可閱讀絕大多數內容。在您瀏覽網站時，伺服器會自動記錄相關日誌（Log），包括您使用的連線設備的 IP 位址、使用時間、使用的瀏覽器、瀏覽及點選資料記錄等。這些數據僅供流量統計、整體行為分析以改進網站服務品質，不會與您的個人身分進行個別比對。
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            <Bell className="h-5 w-5 text-amber-500" />
            3. Google AdSense 與第三方廣告技術規範
          </h2>
          <p>
            本網站使用 Google AdSense 提供廣告服務。Google 作為第三方廣告發布商，會透過 Cookie 來向造訪本網站及其他網站的使用者投放廣告：
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              Google 及其合作夥伴會使用廣告 Cookie（例如 DoubleClick Cookie），根據使用者先前造訪本網站或其他網站的記錄投放相關廣告。
            </li>
            <li>
              使用者可以前往{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 underline hover:text-amber-500"
              >
                Google 廣告設定
              </a>
              ，自由選擇停用個人化廣告。
            </li>
            <li>
              您亦可透過造訪{" "}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 underline hover:text-amber-500"
              >
                aboutads.info
              </a>
              ，選擇停用部分第三方廠商為提供個人化廣告所使用的 Cookie。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            <FileText className="h-5 w-5 text-amber-500" />
            4. Cookie 技術之使用與管理
          </h2>
          <p>
            為了提供最佳的網站服務體驗，本網站會在您的電腦中放置並取用我們的 Cookie。若您不願接受 Cookie 的寫入，您可在您使用的瀏覽器功能項中設定隱私權等級為高，即可拒絕 Cookie 的寫入，但可能會導致網站某些功能無法正常執行。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            5. 外部連結宣告
          </h2>
          <p>
            本網站的文章中可能包含前往其他外部網站的連結（如 Facebook、Instagram、IMDb 或電影官方網站）。該等外部網站均有其獨立之隱私權規範與條款，本網站不對任何外部網站的內容、安全性或隱私權作法負任何責任。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            6. 隱私權政策之修正與聯繫管道
          </h2>
          <p>
            本網站隱私權保護政策將因應法規變動與服務需求隨時進行修正，修正後的條款將直接刊登於本頁面。若您對本隱私權政策或個人資料處理有任何疑問，歡迎隨時透過{" "}
            <Link href="/contact" className="text-amber-600 underline hover:text-amber-500">
              聯絡我們
            </Link>{" "}
            頁面與我們取得聯繫。
          </p>
        </section>
      </div>
    </div>
  );
}
