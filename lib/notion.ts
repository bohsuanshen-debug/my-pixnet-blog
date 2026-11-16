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
 * 遞迴擷取單一 Notion Block 內的所有純文字
 */
function extractTextFromBlock(block: any): string {
  const texts: string[] = [];

  const collect = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (typeof record.plain_text === "string") {
      texts.push(record.plain_text);
      return;
    }
    for (const value of Object.values(record)) {
      if (Array.isArray(value)) {
        value.forEach(collect);
      } else if (value && typeof value === "object") {
        collect(value);
      }
    }
  };

  collect(block);
  return texts.join("");
}

/**
 * 從文章標題與內文區塊自動擷取「好看指數」、「推薦指數」與「上映年份」
 */
function extractScoreAndYear(
  title: string,
  blocks: NotionBlock[]
): {
  watchScore?: number;
  recommendScore?: number;
  releaseYear?: string;
} {
  const lineTexts = blocks.map(extractTextFromBlock).filter(Boolean);
  const fullText = lineTexts.join("\n");

  // 1. 擷取「好看指數：5/10」
  const watchMatch = fullText.match(
    /好看指數[：:]\s*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/
  );
  const watchScore = watchMatch ? parseFloat(watchMatch[1]) : undefined;

  // 2. 擷取「推薦指數：8/10」
  const recommendMatch = fullText.match(
    /推薦指數[：:]\s*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/
  );
  const recommendScore = recommendMatch
    ? parseFloat(recommendMatch[1])
    : undefined;

  // 3. 擷取上映年份（優先標題 -> 前段括號內年份 -> 前段一般四位數年份）
  let releaseYear: string | undefined = undefined;
  const titleYearMatch = title.match(/(?:19|20)\d{2}/);
  if (titleYearMatch) {
    releaseYear = titleYearMatch[0];
  } else {
    const introText = lineTexts.slice(0, 10).join(" ");
    const parenYearMatch = introText.match(
      /[（(][^）)]*?((?:19|20)\d{2})[^）)]*?[）)]/
    );
    if (parenYearMatch) {
      releaseYear = parenYearMatch[1];
    } else {
      const generalYearMatch = introText.match(/(?:19|20)\d{2}/);
      if (generalYearMatch) {
        releaseYear = generalYearMatch[0];
      }
    }
  }

  return {
    watchScore:
      watchScore !== undefined && !Number.isNaN(watchScore)
        ? watchScore
        : undefined,
    recommendScore:
      recommendScore !== undefined && !Number.isNaN(recommendScore)
        ? recommendScore
        : undefined,
    releaseYear,
  };
}

/**
 * 取得資料庫中所有發布的文章列表（含自動擷取評分與上映年份，使用 React cache 記憶化）
 */
export const getAllPosts = cache(async (): Promise<BlogPost[]> => {
  if (!DATABASE_ID) {
    console.warn("NOTION_DATABASE_ID 未設定");
    return [];
  }

  let retries = 3;
  while (retries > 0) {
    try {
      const allPages: any[] = [];
      let cursor: string | undefined = undefined;

      while (true) {
        const response: any = await notion.databases.query({
          database_id: DATABASE_ID,
          start_cursor: cursor,
          sorts: [
            {
              property: "Date",
              direction: "descending",
            },
          ],
        });

        allPages.push(...response.results);
        if (!response.has_more) break;
        cursor = response.next_cursor;
      }

      const posts: BlogPost[] = allPages
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

      // 分批讀取文章內文區塊，自動擷取「好看指數」、「推薦指數」與「上映年份」
      const BATCH_SIZE = 5;
      for (let i = 0; i < posts.length; i += BATCH_SIZE) {
        const batch = posts.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (post) => {
            try {
              const blocks = await getPageBlocks(post.id);
              const extracted = extractScoreAndYear(post.title, blocks);
              post.watchScore = extracted.watchScore;
              post.recommendScore = extracted.recommendScore;
              post.releaseYear = extracted.releaseYear;
            } catch (err) {
              console.warn(`解析文章評分與年份失敗 (${post.title}):`, err);
            }
          })
        );
        if (i + BATCH_SIZE < posts.length) {
          await sleep(350);
        }
      }

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