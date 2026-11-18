import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Popcorn,
  Heart,
  Clapperboard,
  Briefcase,
  Scissors,
  Cat,
  User,
} from "lucide-react";

export const metadata: Metadata = {
  title: "關於《影視戴爾瑞》與沈伯｜影視戴爾瑞",
  description:
    "關於《影視戴爾瑞》的觀影理念與雙指標評分系統，以及創作者沈伯（aka シン）——北漂社畜、接案剪輯師兼專業鏟屎官的影視生活日常。",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* 返回首頁 */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回文章列表</span>
        </Link>
      </div>

      <div className="space-y-8">
        {/* =========================================================
            板塊一：關於《影視戴爾瑞》（網站定位與雙評分系統）
           ========================================================= */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          {/* 頂部琥珀色微光裝飾條 */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />

          <header className="border-b border-slate-200/80 pb-6 dark:border-slate-800">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-amber-700 dark:bg-amber-400/10 dark:text-amber-300 mb-3">
              <Clapperboard className="h-3.5 w-3.5" />
              <span>ABOUT THE BLOG</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              關於《影視戴爾瑞》
            </h1>
          </header>

          <div className="mt-6 space-y-5 text-[16.5px] sm:text-[17px] leading-[1.9] text-slate-700 dark:text-slate-300">
            <p>
              在這裡沒有什麼高深的電影理論，也沒有那種「一定要看懂才算懂電影」的包袱。對我來說，這裡單純就是一個用來記錄我看過哪些電影、影集、MV 或是玩過什麼遊戲的小天地。
            </p>

            <p>
              平常下班後最放鬆的事，就是挑部片來看、挑個遊戲來打，然後把當下最真實的感想寫下來。其實作品好不好看本來就很主觀——有時候一部片爽度夠、節奏抓得恰到好處，就算劇情裡有點小瑕疵，我還是會看得很開心；反過來說，如果哪裡覺得不對勁，我也會老老實實地把缺點寫出來。
            </p>

            <p className="font-medium text-slate-800 dark:text-slate-200">
              為了讓每篇心得看起來更直覺，我在文章最後都會附上兩個指標：
            </p>

            {/* 雙指標特色對比卡片 */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] to-transparent p-5 transition-all hover:border-emerald-500/40 dark:border-emerald-400/20 dark:from-emerald-950/30">
                <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                    <Popcorn className="h-4 w-4" />
                  </span>
                  <span>◆ 爆米花指數</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  純粹看這部作品的娛樂性、節奏與爽度，適不適合配爆米花輕鬆看。
                </p>
              </div>

              <div className="group rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] to-transparent p-5 transition-all hover:border-amber-500/40 dark:border-amber-400/20 dark:from-amber-950/30">
                <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300 mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300">
                    <Heart className="h-4 w-4" />
                  </span>
                  <span>◆ 超主觀評分</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  完全代表我個人當下的喜好程度，沒有標準答案，純屬個人偏愛。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            板塊二：關於沈伯 aka シン（創作者檔案卡片）
           ========================================================= */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-amber-50/40 p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-amber-950/20">
          {/* 右上角裝飾性大水印圖示 */}
          <Clapperboard className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rotate-12 text-slate-900/[0.03] dark:text-white/[0.03]" />

          <header className="relative border-b border-slate-200/80 pb-6 dark:border-slate-800">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold tracking-wider text-slate-600 dark:bg-white/10 dark:text-slate-300 mb-3">
              <User className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>CREATOR PROFILE</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-2.5">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                關於沈伯
              </h2>
              <span className="rounded-lg bg-amber-500/10 px-2.5 py-0.5 font-mono text-sm font-semibold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                aka シン
              </span>
            </div>

            {/* 創作者斜槓身份膠囊標籤 */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Briefcase className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                北漂社畜
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 shadow-2xs dark:border-amber-400/30 dark:bg-amber-950/50 dark:text-amber-300">
                <Scissors className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                接案剪輯師
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800 shadow-2xs dark:border-orange-400/30 dark:bg-orange-950/50 dark:text-orange-300">
                <Cat className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                專業鏟屎官
              </span>
            </div>
          </header>

          {/* 沈伯自介內文 */}
          <div className="relative mt-6 space-y-5 text-[16.5px] sm:text-[17px] leading-[1.9] text-slate-700 dark:text-slate-300">
            <p className="font-medium text-slate-900 dark:text-slate-100">
              嗨，大家好，我是沈伯 aka シン！
            </p>

            <p>
              本業是個北漂社畜，同時也是接案剪輯師，偶爾還得兼任家裡的專業鏟屎官。
            </p>

            <p>
              因為平常工作就離不開影像、節奏與剪接，看片和打電動對我來說，不只是下班後最放鬆的喘息時間，也是觀察別人怎麼說故事的日常。在這裡沒有什麼高深的電影理論，也沒有那種「一定要看懂才算懂電影」的包袱，單純就是用來記錄我看過哪些電影、影集、MV 或是玩過什麼遊戲的小天地。如果你也喜歡看片、追劇、打電動，或者剛好對同一部作品有不一樣的看法，都非常歡迎隨時找我聊聊～
            </p>
          </div>

          {/* 底部社群互動導流區 */}
          <footer className="relative mt-8 rounded-2xl border border-slate-200/70 bg-white/80 p-5 space-y-2 text-[15.5px] text-slate-700 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>FOLLOW &amp; CHAT</span>
            </div>
            <p>
              喜歡的朋友快到FB給
              <a
                href="https://www.facebook.com/bohsuanmoviediary"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 underline underline-offset-4 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                【影視戴爾瑞】
              </a>
              一個讚👍
            </p>
            <p>
              更多影視分享，請到
              <a
                href="https://www.instagram.com/bh_moviediary"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-pink-600 underline underline-offset-4 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
              >
                【影視戴爾瑞】
              </a>
              Instagram
            </p>
          </footer>
        </section>
      </div>
    </div>
  );
}