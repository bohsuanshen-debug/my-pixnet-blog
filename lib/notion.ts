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
 * 從文章標題與內文區塊自動擷取「好看指數」、「推薦指數」與「上映年份」（僅在資料庫欄位為空時執行）
 */
function extractScoreAndYearFromContent(
  title: string,
  blocks: NotionBlock[]
): {
  watchScore?: number;
  recommendScore?: number;
  releaseYear?: string;
} {
  const lineTexts = blocks.map(extractTextFromBlock).filter(Boolean);
  const fullText = lineTexts.join("\n");

  const watchMatch = fullText.match(
    /好看指數[：:]\s*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/
  );
  const watchScore = watchMatch ? parseFloat(watchMatch[1]) : undefined;

  const recommendMatch = fullText.match(
    /推薦指數[：:]\s*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/
  );
  const recommendScore = recommendMatch
    ? parseFloat(recommendMatch[1])
    : undefined;

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
 * 取得資料庫中所有發布的文章列表（優先讀取資料庫欄位，缺漏欄位才掃描內文區塊）
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

          // 1. 優先讀取 Notion 資料庫欄位
          const watchScore = parseNumericProperty(props["好看指數"]);
          const recommendScore = parseNumericProperty(props["推薦指數"]);
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

      // 2. 僅篩選出「尚有缺漏欄位」的文章，掃描內文補齊（設 6 秒總時限確保絕不逾時）
      const postsNeedingFallback = posts.filter(
        (post) =>
          post.watchScore === undefined ||
          post.recommendScore === undefined ||
          post.releaseYear === undefined
      );

      const startTime = Date.now();
      const BATCH_SIZE = 6;
      for (let i = 0; i < postsNeedingFallback.length; i += BATCH_SIZE) {
        if (Date.now() - startTime > 6000) {
          console.warn("內文掃描達安全時間上限，剩餘文章將於下次背景更新補齊");
          break;
        }
        const batch = postsNeedingFallback.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (post) => {
            try {
              const blocks = await getPageBlocks(post.id);
              const extracted = extractScoreAndYearFromContent(
                post.title,
                blocks
              );
              if (post.watchScore === undefined) {
                post.watchScore = extracted.watchScore;
              }
              if (post.recommendScore === undefined) {
                post.recommendScore = extracted.recommendScore;
              }
              if (post.releaseYear === undefined) {
                post.releaseYear = extracted.releaseYear;
              }
            } catch (err) {
              console.warn(`解析文章評分與年份失敗 (${post.title}):`, err);
            }
          })
        );
        if (i + BATCH_SIZE < postsNeedingFallback.length) {
          await sleep(250);
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