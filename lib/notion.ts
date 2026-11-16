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
  watchScore?: number;     // 超主觀評分 (滿分 10)
  recommendScore?: number; // 爆米花指數 (滿分 10)
  releaseYear?: string;    // 上映年份 (4 位數)
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

export function extractSlug(page: any): string {
  const origUrl = page.properties?.["Original URL"]?.url || "";
  const match = origUrl.match(/\/blog\/posts?\/(\d+)/);
  if (match && match[1]) {
    return match[1];
  }
  return page.id.replace(/-/g, "");
}

function parseNumericProperty(prop: any): number | undefined {
  if (!prop) return undefined;
  if (prop.type === "number" && typeof prop.number === "number") {
    return prop.number;
  }
  if (prop.type === "rich_text") {
    const raw = prop.rich_text?.[0]?.plain_text || "";
    const match = raw.match(/(\d+(?:\.\d+)?)/);
    if (match) return parseFloat(match[1]);
  }
  if (prop.type === "select" && prop.select?.name) {
    const match = prop.select.name.match(/(\d+(?:\.\d+)?)/);
    if (match) return parseFloat(match[1]);
  }
  return undefined;
}

function parseYearProperty(prop: any): string | undefined {
  if (!prop) return undefined;
  if (prop.type === "number" && typeof prop.number === "number") {
    const str = String(Math.floor(prop.number));
    return /^(?:19|20)\d{2}$/.test(str) ? str : undefined;
  }
  if (prop.type === "rich_text") {
    const raw = prop.rich_text?.[0]?.plain_text || "";
    const match = raw.match(/(?:19|20)\d{2}/);
    return match ? match[0] : undefined;
  }
  if (prop.type === "select" && prop.select?.name) {
    const match = prop.select.name.match(/(?:19|20)\d{2}/);
    return match ? match[0] : undefined;
  }
  return undefined;
}

export const getAllPosts = cache(async (): Promise<BlogPost[]> => {
  if (!DATABASE_ID) {
    console.warn("NOTION_DATABASE_ID 未設定");
    return [];
  }

  let retries = 4;
  while (retries > 0) {
    try {
      const allPages: any[] = [];
      let cursor: string | undefined = undefined;

      while (true) {
        const queryParams: any = {
          database_id: DATABASE_ID,
          sorts: [{ property: "Date", direction: "descending" }],
        };
        if (cursor) {
          queryParams.start_cursor = cursor;
        }

        const response: any = await notion.databases.query(queryParams);
        allPages.push(...response.results);
        if (!response.has_more || !response.next_cursor) break;
        cursor = response.next_cursor;
      }

      return allPages
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

          const watchScore =
            parseNumericProperty(props["超主觀評分"]) ??
            parseNumericProperty(props["好看指數"]);
          const recommendScore =
            parseNumericProperty(props["爆米花指數"]) ??
            parseNumericProperty(props["推薦指數"]);
          let releaseYear = parseYearProperty(props["上映年份"]);

          if (!releaseYear) {
            const titleYear = title.match(/(?:19|20)\d{2}/);
            if (titleYear) releaseYear = titleYear[0];
          }

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
            watchScore,
            recommendScore,
            releaseYear,
          };
        });
    } catch (error: any) {
      retries--;
      if (retries === 0) {
        console.error("無法自 Notion 抓取文章列表:", error);
        return [];
      }
      await sleep(1000 * (4 - retries));
    }
  }
  return [];
});

export const getAllPostsMeta = getAllPosts;

export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const allPosts = await getAllPosts();
  const matched = allPosts.find(
    (p) => p.slug === slug || p.id === slug || p.id.replace(/-/g, "") === slug
  );
  return matched || null;
});

export const getPageBlocks = cache(async (blockId: string): Promise<NotionBlock[]> => {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    let retries = 5;
    let success = false;

    while (retries > 0) {
      try {
        const listParams: any = {
          block_id: blockId,
          page_size: 100,
        };
        if (cursor) {
          listParams.start_cursor = cursor;
        }

        const response: any = await notion.blocks.children.list(listParams);
        blocks.push(...response.results);

        if (!response.has_more || !response.next_cursor) {
          return blocks;
        }
        cursor = response.next_cursor;
        success = true;
        break;
      } catch (error: any) {
        retries--;
        const attempt = 5 - retries;
        if (retries === 0) {
          console.error(`獲取 Notion 區塊最終失敗 (Block ID: ${blockId}):`, error);
          return blocks;
        }
        await sleep(800 * attempt);
      }
    }

    if (!success) break;
  }

  return blocks;
});