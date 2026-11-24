"use client";

import React, { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";

interface AmbientPostLayoutProps {
  coverImage?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

const DEFAULT_BG = "linear-gradient(135deg, #2b2d42 0%, #1d1e2c 100%)";

export default function AmbientPostLayout({
  coverImage,
  maxWidthClass = "max-w-6xl",
  children,
}: AmbientPostLayoutProps) {
  const [gradient, setGradient] = useState<string>(DEFAULT_BG);

  useEffect(() => {
    if (!coverImage) return;

    let isMounted = true;
    const fac = new FastAverageColor();

    fac
      .getColorAsync(coverImage, {
        algorithm: "dominant",
        crossOrigin: "anonymous",
      })
      .then((color) => {
        if (!isMounted) return;
        const [r, g, b] = color.value;
        const cPrimary = `rgb(${r}, ${g}, ${b})`;
        const cDark = `rgb(${Math.max(10, Math.floor(r * 0.4))}, ${Math.max(10, Math.floor(g * 0.4))}, ${Math.max(15, Math.floor(b * 0.4))})`;
        const cLight = `rgb(${Math.min(255, Math.floor(r * 1.3 + 30))}, ${Math.min(255, Math.floor(g * 1.3 + 30))}, ${Math.min(255, Math.floor(b * 1.3 + 30))})`;

        setGradient(
          `radial-gradient(ellipse at 50% -10%, ${cLight} 0%, ${cPrimary} 45%, ${cDark} 100%)`
        );
      })
      .catch(() => {
        // Fallback
      });

    return () => {
      isMounted = false;
      fac.destroy();
    };
  }, [coverImage]);

  return (
    <div
      className="relative min-h-screen w-full transition-colors duration-700 ease-out py-6 sm:py-12 px-3 sm:px-6 overflow-hidden"
      style={{
        background: gradient,
        backgroundAttachment: "fixed",
      }}
    >
      {/* 若有封面，在背景放一個高斯模糊巨幅光暈底圖（類似 iOS 鎖定畫面桌布散景） */}
      {coverImage && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
          <div
            className="absolute -inset-[20%] bg-cover bg-center blur-[60px] opacity-45 scale-110 transform-gpu"
            style={{ backgroundImage: `url(${coverImage})` }}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* ── iPhone 通知卡片材質 (iOS Liquid Glass Modal) ── */}
      <div
        className={`relative z-10 mx-auto ${maxWidthClass} rounded-[28px] sm:rounded-[36px] ios-glass-card p-6 sm:p-10 md:p-14 transition-all duration-300`}
      >
        {/* 卡片頂部微反光倒角光邊 (模擬蘋果玻璃邊緣高光) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        {children}
      </div>
    </div>
  );
}