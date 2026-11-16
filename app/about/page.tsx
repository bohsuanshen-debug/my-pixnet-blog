import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Film, Clapperboard, Heart, Sparkles, BookOpen, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "關於我們 (About Us)",
  description: "影視戴爾瑞站長簡介、創作初衷、內容原創性承諾與影視評論理念。",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* 頂部標題 */}
      <div className="mb-10 text-center sm:text-left border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300 mb-3">
          <Clapperboard className="h-4 w-4" />
          <span>關於本站與創作者</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          關於【影視戴爾瑞】
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
          用文字銘刻光影的溫度，紀錄大銀幕與串流劇集裡最真摯的感動瞬間。
        </p>
      </div>

      {/* 核心介紹區塊 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-12">
        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-amber-500/30 mb-4 shadow">
            <Image
              src="/logo.jpg"
              alt="影視戴爾瑞 Logo"
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            戴爾瑞 (Bohsuan)
          </h2>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
            影評作家 / 影視愛好者
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href="https://www.facebook.com/bohsuanmoviediary"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
            >
              FB 粉專
            </a>
            <a
              href="https://www.instagram.com/bh_moviediary"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700 hover:bg-pink-100 dark:bg-pink-950/40 dark:text-pink-300"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            創立初衷：為什麼會有「影視戴爾瑞」？
          </h3>
          <p>
            電影與影集不只是消遣時光的娛樂，很多時候它是一面鏡子，映照出我們在生活、職場、感情裡難以啟齒的困惑與情感。「影視戴爾瑞」起源於站長在各大社群平台的觀影隨筆，期盼透過平實、真誠且不隨波逐流的視角，帶領讀者看見角色內心的掙扎與主創團隊想傳遞的哲學。
          </p>
          <p>
            從原本在痞客邦累積的大量長文心得，到如今全新升級的獨立站台，我們始終秉持<strong>「每篇文章均親筆手寫、拒絕農場文與無腦抄襲」</strong>的初衷，提供喜愛電影的朋友一個乾淨、純粹的閱讀殿堂。
          </p>
        </div>
      </div>

      {/* 內容與品質承諾 */}
      <div className="space-y-6 rounded-2xl bg-slate-100/70 p-6 sm:p-8 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-12">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          我們的創作方針與品質承諾
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-amber-500" />
              100% 原創深度解析
            </div>
            所有影評與短評皆出自站長實際觀看後的反思整理，包含劇情結構探討、演員表現評價及核心隱喻剖析。
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <Film className="h-4 w-4 text-amber-500" />
              多元類型影視涵蓋
            </div>
            從院線好萊塢商業大片、金馬獨立藝術電影，到 Netflix、Disney+ 國內外熱門話題影集，提供全方位觀影指南。
          </div>
        </div>
      </div>

      {/* 底部導引 */}
      <div className="text-center pt-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          有商業合作、文章轉載需求，或是單純想聊聊電影？
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          聯繫我們
        </Link>
      </div>
    </div>
  );
}
