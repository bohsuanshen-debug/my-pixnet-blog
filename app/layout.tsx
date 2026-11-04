import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AdSenseScript } from "@/components/AdSense";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  title: {
    default: "影視戴爾瑞 | 視聽娛樂與電影評論部落格",
    template: "%s | 影視戴爾瑞",
  },
  description: "精選電影評論、深度觀影筆記與影視文化觀點，全自動同步自 Notion。",
  authors: [{ name: "戴爾瑞" }],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "/",
    siteName: "影視戴爾瑞",
    title: "影視戴爾瑞 | 視聽娛樂與電影評論部落格",
    description: "精選電影評論、深度觀影筆記與影視文化觀點，全自動同步自 Notion。",
  },
  twitter: {
    card: "summary_large_image",
    title: "影視戴爾瑞",
    description: "精選電影評論、深度觀影筆記與影視文化觀點。",
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
