import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function estimateReadingTime(blocks: any[]): number {
  let wordCount = 0;
  for (const block of blocks) {
    const type = block.type;
    const richText = block[type]?.rich_text;
    if (Array.isArray(richText)) {
      for (const item of richText) {
        wordCount += (item.plain_text || "").length;
      }
    }
  }
  // 中文一般閱讀速度每分鐘約 300~500 字，取 400 字/分鐘
  return Math.max(1, Math.ceil(wordCount / 400));
}
