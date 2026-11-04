import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://moviesdiary.vercel.app"),
  title: {
    default: "影視戴爾瑞 | 電影影集心得分享",
    template: "%s | 影視戴爾瑞",
  },
  description: "紀錄影視感動瞬間。分享電影、影集心得，喜歡的朋友快到 FB 給【影視戴爾瑞】一個讚！",
  authors: [{ name: "戴爾瑞" }],
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "12fb8cUsqPU1kryC7D5aWM28QHxpY6yti1lAOWG4kkI",
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
        {/* ── 原生 AdSense 程式碼片段（直接注入 <head>） ── */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1840753808001223"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        
        {/* ── GA4 追蹤碼 ── */}
        <GoogleAnalytics gaId="G-93Q9T0VBMF" />
      </body>
    </html>
  );
}