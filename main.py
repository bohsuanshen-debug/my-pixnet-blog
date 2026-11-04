import os
import sys
import json
import time
import argparse
from datetime import datetime
from tqdm import tqdm

# 確保在 Windows 控制台輸出繁體中文不亂碼
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from config import Config
from pixnet_parser import fetch_sitemap_urls, scrape_pixnet_article
from image_manager import ImageManager
from notion_service import NotionMigrator, html_to_notion_blocks

REDIRECT_MAP_FILE = "redirect_map.json"

def load_redirect_map() -> dict:
    if os.path.exists(REDIRECT_MAP_FILE):
        try:
            with open(REDIRECT_MAP_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_redirect_map(mapping: dict):
    with open(REDIRECT_MAP_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)

def main():
    parser = argparse.ArgumentParser(description="痞客邦 (Pixnet) 文章全自動搬家至 Notion")
    parser.add_argument("--sitemap", type=str, help="覆寫 .env 中的 PIXNET_SITEMAP_URL")
    parser.add_argument("--limit", type=int, default=0, help="僅處理前 N 篇文章 (用於測試)")
    parser.add_argument("--dry-run", action="store_true", help="乾跑模式：僅爬取清洗，不上傳圖床與 Notion")
    parser.add_argument("--force", action="store_true", help="強制重新搬移已在 redirect_map.json 中的文章")
    args = parser.parse_args()

    print("=" * 60)
    print("🚀 痞客邦 (Pixnet) -> Notion 文章全自動搬家工具")
    print("=" * 60)

    sitemap_url = args.sitemap or Config.PIXNET_SITEMAP_URL
    if not sitemap_url:
        print("❌ 錯誤：未提供 Sitemap 網址！請於 .env 填寫 PIXNET_SITEMAP_URL 或使用 --sitemap 參數。")
        sys.exit(1)

    if not Config.validate(dry_run=args.dry_run):
        sys.exit(1)

    # 1. 解析 Sitemap 獲取文章清單
    article_urls = fetch_sitemap_urls(sitemap_url)
    if not article_urls:
        print("❌ 未在 Sitemap 中找到任何文章網址，請確認 Sitemap 格式或權限。")
        sys.exit(1)

    print(f"✅ 成功獲取 {len(article_urls)} 篇痞客邦文章網址！")

    if args.limit > 0:
        article_urls = article_urls[:args.limit]
        print(f"⚙️ 已啟用 --limit 限制，本次僅執行前 {args.limit} 篇文章。")

    # 2. 載入既有轉址紀錄 (斷點續傳)
    redirect_map = load_redirect_map()
    print(f"📂 目前 redirect_map.json 已記錄 {len(redirect_map)} 篇歷史文章。")

    # 3. 初始化服務
    image_manager = None
    notion_migrator = None
    if not args.dry_run:
        print("🔧 正在初始化圖床與 Notion 服務...")
        image_manager = ImageManager()
        notion_migrator = NotionMigrator()

    # 4. 開始循序處理
    success_count = 0
    skip_count = 0
    fail_count = 0

    pbar = tqdm(article_urls, desc="搬移進度", unit="篇")
    for url in pbar:
        pbar.set_postfix_str(url.split("/")[-1])

        # 斷點續傳檢查
        if not args.force and url in redirect_map and redirect_map[url].get("status") == "success":
            skip_count += 1
            continue

        try:
            # Step A: 爬取與清洗文章
            article_data = scrape_pixnet_article(url)
            content_soup = article_data["content_soup"]

            if args.dry_run:
                print(f"\n[DRY-RUN] 標題: {article_data['title']}")
                print(f"[DRY-RUN] 日期: {article_data['date']} | 分類: {article_data['category']} | 標籤: {article_data['tags']}")
                print(f"[DRY-RUN] 內文節點數: {len(list(content_soup.children))}")
                success_count += 1
                time.sleep(0.5)
                continue

            # Step B: 圖片轉存防盜鏈處理
            processed_soup = image_manager.process_content_images(content_soup, page_url=url)

            # Step C: 轉換為 Notion Blocks
            notion_blocks = html_to_notion_blocks(processed_soup)

            # Step D: 寫入 Notion Database
            notion_result = notion_migrator.create_page(article_data, notion_blocks)

            # Step E: 寫入轉址紀錄
            redirect_map[url] = {
                "title": article_data["title"],
                "notion_page_id": notion_result["page_id"],
                "notion_url": notion_result["notion_url"],
                "status": "success",
                "migrated_at": datetime.now().isoformat()
            }
            save_redirect_map(redirect_map)
            success_count += 1

            # 友善間隔，避免打爆痞客邦與圖床
            time.sleep(Config.REQUEST_DELAY_SECONDS)

        except Exception as e:
            fail_count += 1
            print(f"\n❌ 處理文章失敗 ({url}): {e}")
            redirect_map[url] = {
                "error": str(e),
                "status": "failed",
                "migrated_at": datetime.now().isoformat()
            }
            save_redirect_map(redirect_map)
            time.sleep(1)

    print("\n" + "=" * 60)
    print("🎉 搬家任務執行完畢！")
    print(f"📊 統計：成功 {success_count} 篇 | 跳過 {skip_count} 篇 | 失敗 {fail_count} 篇")
    print(f"📄 轉址清單已儲存至: {os.path.abspath(REDIRECT_MAP_FILE)}")
    print("=" * 60)

if __name__ == "__main__":
    main()
