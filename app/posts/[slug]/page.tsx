import React from "react";
import { getAllPosts } from "@/lib/notion";
import PostFilterSection from "@/components/PostFilterSection";

// Vercel ISR: 每 60 秒自動背景更新 Notion 最新文章
export const revalidate = 60;

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* 直接在首頁進行分類篩選與日期排序 */}
      <PostFilterSection posts={posts} />
    </div>
  );
}