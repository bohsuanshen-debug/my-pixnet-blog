import React from "react";
import { getAllPosts } from "@/lib/notion";
import PostFilterSection from "@/components/PostFilterSection";

// Vercel ISR: 增量靜態生成，每 60 秒快取失效後重新在背景編譯
export const revalidate = 60;

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PostFilterSection posts={posts} />
    </div>
  );
}