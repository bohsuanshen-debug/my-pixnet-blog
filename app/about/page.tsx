import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Film, Sparkles, Popcorn, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "關於《影視戴爾瑞》與沈伯｜影視戴爾瑞",
  description:
    "在這裡沒有高深的電影理論，單純記錄看過的電影、影集、MV 與遊戲心得，分享最真實的主觀感想與爆米花指數。",
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

      {/* 頁面主卡片 */}
      <article className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        {/* 頂部標籤與主標題 */}
        <header className="border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>ABOUT</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            關於《影視戴爾瑞》與沈伯
          </h1>
        </header>

        {/* 內文段落 */}
        <div className="mt-7 space-y-5 text-[16.5px] sm:text-[17px] leading-[1.9] text-slate-700 dark:text-slate-300">
          <p className="font-medium text-slate-900 dark:text-slate-100">
            嗨，大家好，我是沈伯！
          </p>

          <p>
            在這裡沒有什麼高深的電影理論，也沒有那種「一定要看懂才算懂電影」的包袱。對我來說，這裡單純就是一個用來記錄我看過哪些電影、影集、MV 或是玩過什麼遊戲的小天地。
          </p>

          <p>
            平常下班後最放鬆的事，就是挑部片來看、挑個遊戲來打，然後把當下最真實的感想寫下來。其實作品好不好看本來就很主觀——有時候一部片爽度夠、節奏抓得恰到好處，就算劇情裡有點小瑕疵，我還是會看得很開心；反過來說，如果哪裡覺得不對勁，我也會老老實實地把缺點寫出來。
          </p>

          <p>為了讓每篇心得看起來更直覺，我在文章最後都會附上兩個指標：</p>

          {/* 雙指標特色卡片 */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5 dark:border-emerald-400/20 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5">
                <Popcorn className="h-4 w-4 shrink-0" />
                <span>◆ 爆米花指數</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                純粹看這部作品的娛樂性、節奏與爽度，適不適合配爆米花輕鬆看。
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 dark:border-amber-400/20 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300 mb-1.5">
                <Heart className="h-4 w-4 shrink-0" />
                <span>◆ 超主觀評分</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                完全代表我個人當下的喜好程度，沒有標準答案，純屬個人偏愛。
              </p>
            </div>
          </div>

          <p>
            如果你也喜歡看片、追劇，或者剛好對同一部作品有不一樣的看法，都非常歡迎隨時找我聊聊~
          </p>
        </div>

        {/* 底部社群導流區（與文章內文風格一致） */}
        <footer className="mt-8 border-t border-slate-200/80 pt-6 space-y-2.5 text-[16px] text-slate-700 dark:border-slate-800 dark:text-slate-300">
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
      </article>
    </div>
  );
}