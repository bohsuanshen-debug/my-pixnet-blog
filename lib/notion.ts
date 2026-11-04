import { Client } from "@notionhq/client";
import { cache } from "react";

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  originalUrl?: string;
  coverImage?: string;
  excerpt?: string;
}

export interface NotionRichText {
  type: string;
  plain_text: string;
  text?: {
    content: string;
    link?: { url: string } | null;
  };
  annotations?: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  href?: string | null;
}

export interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  [key: string]: any;
}

/**
 * 從痞客邦原網址提取 ID 作為 SEO 友善的 Slug，若無則回退至 Page ID
 */
export function extractSlug(page: any): string {
  const origUrl = page.properties?.["Original URL"]?.url || "";
  const match = origUrl.match(/\/blog\/posts?\/(\d+)/);
  if (match && match[1]) {
    return match[1];
  }
  return page.id.replace(/-/g, "");
}

/**
 * 取得資料庫中所有發布的文章列表 (按日期由新到舊排序，使用 React cache 記憶化)
 */
export const getAllPosts = cache(async (): Promise<BlogPost[]> => {
  if (!DATABASE_ID) {
    console.warn("NOTION_DATABASE_ID 未設定");
    return [];
  }

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: [
          {
            property: "Date",
            direction: "descending",
          },
        ],
      });

      const posts: BlogPost[] = response.results
        .filter((page: any) => page.properties && page.object === "page")
        .map((page: any) => {
          const props = page.properties;
          const title =
            props.Name?.title?.[0]?.plain_text ||
            props.Title?.title?.[0]?.plain_text ||
            "無標題";

          const date = props.Date?.date?.start || page.created_time || "";
          const category = props.Category?.select?.name || "未分類";
          const tags = (props.Tags?.multi_select || []).map((t: any) => t.name);
          const originalUrl = props["Original URL"]?.url || "";

          let coverImage = "";
          if (page.cover) {
            if (page.cover.type === "external") {
              coverImage = page.cover.external?.url || "";
            } else if (page.cover.type === "file") {
              coverImage = page.cover.file?.url || "";
            }
          }

          return {
            id: page.id,
            slug: extractSlug(page),
            title,
            date,
            category,
            tags,
            originalUrl,
            coverImage,
          };
        });

      return posts;
    } catch (error: any) {
      if (error?.status === 429 || error?.code === "rate_limited") {
        console.warn("Notion API 觸發頻率限制，等待 1.5 秒後重試...");
        await sleep(1500);
        retries--;
        continue;
      }
      console.error("無法自 Notion 抓取文章列表:", error);
      return [];
    }
  }
  return [];
});

/**
 * 依據 Slug 或 Page ID 查詢單篇文章資訊 (使用 React cache 記憶化)
 */
export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const allPosts = await getAllPosts();
  const matched = allPosts.find(
    (p) => p.slug === slug || p.id === slug || p.id.replace(/-/g, "") === slug
  );
  return matched || null;
});

/**
 * 遞迴/分頁獲取文章內的所有區塊 (Notion API 單次最多 100 筆，支援自動重試與 React cache)
 */
export const getPageBlocks = cache(async (blockId: string): Promise<NotionBlock[]> => {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    let retries = 3;
    let success = false;

    while (retries > 0) {
      try {
        const response: any = await notion.blocks.children.list({
          block_id: blockId,
          start_cursor: cursor,
          page_size: 100,
        });

        blocks.push(...response.results);

        if (!response.has_more) {
          return blocks;
        }
        cursor = response.next_cursor;
        success = true;
        break;
      } catch (error: any) {
        if (error?.status === 429 || error?.code === "rate_limited") {
          console.warn("Notion 區塊讀取頻率限制，等待 1.5 秒重試...");
          await sleep(1500);
          retries--;
        } else {
          console.error(`獲取 Notion 區塊失敗 (Block ID: ${blockId}):`, error);
          return blocks;
        }
      }
    }

    if (!success) {
      break;
    }
  }

  return blocks;
});
