import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AdSenseScript } from "@/components/AdSense";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://moviesdiary.vercel.app"),
  title: {
    default: "影視戴爾瑞 | 電影影集心得分享",
    template: "%s | 影視戴爾瑞",
  },
  description: "紀錄影視感動瞬間。分享電影、影集心得，喜歡的朋友快到 FB 給【影視戴爾瑞】一個讚！",
  authors: [{ name: "戴爾瑞" }],
  // ── Google Search Console 驗證 ──────────────────────────────────────────
  // 步驟：到 GSC → 新增資源 → 選「網址前置字串」→ 驗證方式選「HTML 標記」
  // 複製 content="xxxx" 裡的字串，貼到下方 'YOUR_GSC_VERIFICATION_CODE' 位置
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "YOUR_GSC_VERIFICATION_CODE",
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "/",
    siteName: "影視戴爾瑞",
    title: "影視戴爾瑞 | 電影影集心得分享",
    description: "紀錄影視感動瞬間。分享電影、影集心得，喜歡的朋友快到 FB 給【影視戴爾瑞】一個讚！",
    images: [{ url: "/logo.jpg", width: 1024, height: 1024, alt: "影視戴爾瑞 Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "影視戴爾瑞",
    description: "紀錄影視感動瞬間。分享電影、影集心得。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="scroll-smooth">
      <head>
        {/* 全域非同步載入 AdSense 腳本 (非阻塞 lazyOnload) */}
        <AdSenseScript />
      </head>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
