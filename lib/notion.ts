import { Client } from "@notionhq/client";
import { cache } from "react";

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  timeoutMs: 8000, // 單次請求 8 秒超時保護，避免卡死觸發 Vercel 504
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
  watchScore?: number;     // 超主觀評分 (滿分 100)
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

function mapNotionPageToPost(page: any): BlogPost {
  const props = page.properties || {};
  const title =
    props.Name?.title?.[0]?.plain_text ||
    props.Title?.title?.[0]?.plain_text ||
    "";

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

  // 同時支援 Notion 頁面頂部 Cover 與資料庫的 Files 圖片欄位
  let coverImage = "";
  if (page.cover) {
    coverImage =
      page.cover.type === "external"
        ? page.cover.external?.url || ""
        : page.cover.file?.url || "";
  }
  if (!coverImage) {
    const fileProp = Object.values(props).find(
      (p: any) => p?.type === "files" && Array.isArray(p.files) && p.files.length > 0
    ) as any;
    if (fileProp) {
      const firstFile = fileProp.files[0];
      coverImage =
        firstFile.type === "external"
          ? firstFile.external?.url || ""
          : firstFile.file?.url || "";
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
}

/**
 * 查詢所有文章列表（若 Notion API 暫時異常，直接丟出 Error 讓 Vercel 保留舊快取，絕不回傳空陣列洗掉首頁）
 */
export const getAllPosts = cache(async (): Promise<BlogPost[]> => {
  if (!DATABASE_ID) {
    throw new Error("NOTION_DATABASE_ID 環境變數未設定");
  }

  let retries = 4;
  let lastError: any = null;

  while (retries > 0) {
    try {
      const allPages: any[] = [];
      let cursor: string | undefined = undefined;

      while (true) {
        const queryParams: any = {
          database_id: DATABASE_ID,
          page_size: 100,
        };
        if (cursor) {
          queryParams.start_cursor = cursor;
        }

        const response: any = await notion.databases.query(queryParams);
        allPages.push(...response.results);
        if (!response.has_more || !response.next_cursor) break;
        cursor = response.next_cursor;
      }

      const posts = allPages
        .filter((page: any) => page.properties && page.object === "page")
        .map(mapNotionPageToPost)
        .filter((post) => post.title.trim() !== ""); // 自動排除 Notion 中的空白草稿列

      // 本地端依日期由新到舊排序（比讓 Notion 資料庫端排序更快、且不會漏掉無日期文章）
      posts.sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeB - timeA;
      });

      return posts;
    } catch (error: any) {
      lastError = error;
      retries--;
      const attempt = 4 - retries;
      console.warn(`Notion 列表查詢第 ${attempt} 次失敗，準備重試:`, error?.message || error);
      if (retries > 0) {
        await sleep(800 * attempt);
      }
    }
  }

  // 重試全數失敗時丟出錯誤，強制 Vercel ISR 繼續沿用原本正常的舊快取畫面
  throw new Error(`Notion 列表讀取失敗: ${lastError?.message || "Unknown error"}`);
});

export const getAllPostsMeta = getAllPosts;

export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const cleanSlug = slug.replace(/-/g, "").toLowerCase();
  const allPosts = await getAllPosts();
  const matched = allPosts.find(
    (p) =>
      p.slug.toLowerCase() === cleanSlug ||
      p.id.replace(/-/g, "").toLowerCase() === cleanSlug
  );
  if (matched) return matched;

  if (/^[0-9a-f]{32}$/.test(cleanSlug)) {
    try {
      const page: any = await notion.pages.retrieve({ page_id: cleanSlug });
      if (page && page.properties && !page.archived && !page.in_trash) {
        const mapped = mapNotionPageToPost(page);
        return mapped.title.trim() !== "" ? mapped : null;
      }
    } catch (error) {
      console.warn(`直接讀取 Notion Page 失敗 (${cleanSlug}):`, error);
    }
  }

  return null;
});

/**
 * 獲取單篇文章內文區塊（失敗時直接丟出 Error，絕不回傳空陣列導致畫面顯示「此文章尚無內文」並被快取）
 */
export const getPageBlocks = cache(async (blockId: string): Promise<NotionBlock[]> => {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    let retries = 5;
    let success = false;
    let lastError: any = null;

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
        lastError = error;
        retries--;
        const attempt = 5 - retries;
        console.warn(
          `Notion 區塊讀取第 ${attempt} 次重試 (Block ID: ${blockId}):`,
          error?.code || error?.status || error?.message
        );
        if (retries > 0) {
          await sleep(700 * attempt);
        }
      }
    }

    if (!success) {
      // 重試全數失敗時直接丟出錯誤，防止寫入空白快取
      throw new Error(
        `Notion 區塊讀取失敗 (Block ID: ${blockId}): ${lastError?.message || "Unknown error"}`
      );
    }
  }

  return blocks;
});