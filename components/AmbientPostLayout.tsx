"use client";

import React, { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";

interface AmbientPostLayoutProps {
  coverImage?: string;
  children: React.ReactNode;
}

// 預設降級：柔和的暖米灰漸層（#F5F3EE 到 #E5E0D8）
const DEFAULT_BG = "linear-gradient(135deg, #F5F3EE 0%, #E5E0D8 100%)";

export default function AmbientPostLayout({
  coverImage,
  children,
}: AmbientPostLayoutProps) {
  const [backgroundStyle, setBackgroundStyle] = useState<string>(DEFAULT_BG);

  useEffect(() => {
    if (!coverImage) {
      setBackgroundStyle(DEFAULT_BG);
      return;
    }

    let isMounted = true;
    const fac = new FastAverageColor();

    // 透過 Image 物件與 crossOrigin 萃取主色調
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.src = coverImage;

    img.onload = () => {
      try {
        const color = fac.getColor(img, {
          algorithm: "dominant",
          ignoredColor: [
            [255, 255, 255, 255], // 忽略純白邊框
            [0, 0, 0, 255, 50],   // 忽略過深的純黑
          ],
        });

        if (!isMounted) return;

        const [r, g, b] = color.value;
        // 生成深淺層次：主氛圍色（較柔和飽滿）與較深/同調的底色
        // 降低透明度或調整明暗，打造類似電影放映室海報微光效果
        const primaryColor = `rgb(${r}, ${g}, ${b})`;
        const secondaryColor = `rgb(${Math.max(0, Math.floor(r * 0.55))}, ${Math.max(0, Math.floor(g * 0.55))}, ${Math.max(0, Math.floor(b * 0.55))})`;
        const accentSoftColor = `rgb(${Math.min(255, Math.floor(r * 1.25 + 30))}, ${Math.min(255, Math.floor(g * 1.25 + 30))}, ${Math.min(255, Math.floor(b * 1.25 + 30))})`;

        // 放射漸層結合線性漸層，呈現電影海報主體聚焦的光暈感
        const gradient = `radial-gradient(ellipse at 50% 0%, ${accentSoftColor} 0%, ${primaryColor} 45%, ${secondaryColor} 100%)`;
        setBackgroundStyle(gradient);
      } catch (err) {
        // CORS 或畫布存取受限時安全降級
        if (isMounted) setBackgroundStyle(DEFAULT_BG);
      }
    };

    img.onerror = () => {
      if (isMounted) setBackgroundStyle(DEFAULT_BG);
    };

    return () => {
      isMounted = false;
      fac.destroy();
    };
  }, [coverImage]);

  return (
    <div
      className="relative min-h-screen w-full transition-all duration-700 ease-out py-6 sm:py-12 px-3 sm:px-6"
      style={{
        background: backgroundStyle,
        backgroundAttachment: "fixed",
      }}
    >
      {/* 柔化微噪點與氛圍微光覆蓋層 */}
      <div className="pointer-events-none absolute inset-0 bg-black/10 backdrop-brightness-[0.98]" />

      {/* 置前文章主體卡片（半透明白底毛玻璃朦版） */}
      <div className="relative mx-auto max-w-4xl rounded-2xl sm:rounded-3xl border border-white/60 bg-white/90 p-5 sm:p-8 md:p-12 shadow-2xl backdrop-blur-md transition-shadow">
        {children}
      </div>
    </div>
  );
}
