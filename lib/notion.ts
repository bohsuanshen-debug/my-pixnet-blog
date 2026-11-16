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
 * 輕量級文章列表查詢（僅查詢資料庫 Metadata，不掃描內文區塊，供單篇內頁與路由生成極速使用）
 */
export const getAllPostsMeta = cache(async (): Promise<BlogPost[]> => {
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

/**
 * 首頁專用完整文章列表（優先讀取資料庫欄位，缺漏欄位才掃描內文區塊）
 */
export const getAllPosts = cache(async (): Promise<BlogPost[]> => {
  const basePosts = await getAllPostsMeta();
  const posts = basePosts.map((p) => ({ ...p }));

  const postsNeedingFallback = posts.filter(
    (post) =>
      post.watchScore === undefined ||
      post.recommendScore === undefined ||
      post.releaseYear === undefined
  );

  const startTime = Date.now();
  const BATCH_SIZE = 4;
  for (let i = 0; i < postsNeedingFallback.length; i += BATCH_SIZE) {
    if (Date.now() - startTime > 5500) {
      console.warn("內文掃描達安全時間上限，剩餘文章將於下次背景更新補齊");
      break;
    }
    const batch = postsNeedingFallback.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (post) => {
        try {
          const blocks = await getPageBlocks(post.id);
          if (blocks.length === 0) return;
          const extracted = extractScoreAndYearFromContent(post.title, blocks);
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
      await sleep(300);
    }
  }

  return posts;
});

/**
 * 依據 Slug 或 Page ID 查詢單篇文章基本資訊（使用輕量查詢，絕不因掃描全站內文而耗盡 API 額度）
 */
export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const allPosts = await getAllPostsMeta();
  const matched = allPosts.find(
    (p) => p.slug === slug || p.id === slug || p.id.replace(/-/g, "") === slug
  );
  return matched || null;
});

/**
 * 遞迴/分頁獲取單篇文章內的所有區塊（含指數退避重試機制，防止偶發網路或限流導致空白內文）
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
        // 指數退避等待：800ms -> 1600ms -> 2400ms -> 3200ms
        await sleep(800 * attempt);
      }
    }

    if (!success) {
      break;
    }
  }

  return blocks;
});