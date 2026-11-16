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
  watchScore?: number;     // 好看指數 (滿分 10)
  recommendScore?: number; // 推薦指數 (滿分 10)
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
 * 通用 Notion 欄位解析器：兼容 Number、Rich Text 與 Select 屬性型別
 */
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

/**
 * 極速查詢資料庫中所有發布的文章列表（純讀取資料庫欄位，0 額外內文區塊請求）
 */
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
          sorts: [
            {
              property: "Date",
              direction: "descending",
            },
          ],
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

          // 直接從 Notion 資料庫欄位讀取評分與上映年份
          const watchScore = parseNumericProperty(props["好看指數"]);
          const recommendScore = parseNumericProperty(props["推薦指數"]);
          let releaseYear = parseYearProperty(props["上映年份"]);

          // 若資料庫未填寫上映年份，順手從文章標題比對（純字串運算，不耗費 API）
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

// 保持向下相容別名，確保任何頁面引用皆不會報錯
export const getAllPostsMeta = getAllPosts;

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
 * 遞迴/分頁獲取單篇文章內的所有區塊（含指數退避重試機制，確保單篇內文穩定載入）
 */
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
        console.warn(
          `Notion 區塊讀取第 ${attempt} 次重試 (Block ID: ${blockId}):`,
          error?.code || error?.status || error?.message
        );
        if (retries === 0) {
          console.error(`獲取 Notion 區塊最終失敗 (Block ID: ${blockId}):`, error);
          return blocks;
        }
        await sleep(800 * attempt);
      }
    }

    if (!success) {
      break;
    }
  }

  return blocks;
});