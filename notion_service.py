import time
from bs4 import BeautifulSoup, NavigableString, Tag
from notion_client import Client
from config import Config

def create_rich_text(content: str) -> list[dict]:
    """
    建立 Notion rich_text 物件陣列，自動處理單一段落超過 2000 字元的上限問題
    """
    if not content:
        return []
    
    # 限制每個 rich_text chunk 最大 2000 字元 (Notion API 限制)
    chunks = [content[i:i + 2000] for i in range(0, len(content), 2000)]
    return [{"type": "text", "text": {"content": chunk}} for chunk in chunks]

def html_to_notion_blocks(content_soup: BeautifulSoup) -> list[dict]:
    """
    將清洗後的 BeautifulSoup 內文轉換為 Notion Block 結構列表
    """
    blocks = []

    def process_node(node):
        if isinstance(node, NavigableString):
            text = str(node).strip()
            if text:
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {"rich_text": create_rich_text(text)}
                })
            return

        if not isinstance(node, Tag):
            return

        tag_name = node.name.lower()

        # 1. 圖片處理
        if tag_name == "img":
            src = node.get("src", "").strip()
            if src and src.startswith("http"):
                blocks.append({
                    "object": "block",
                    "type": "image",
                    "image": {
                        "type": "external",
                        "external": {"url": src}
                    }
                })
            return

        # 2. 標題處理
        if tag_name in ["h1", "h2"]:
            text = node.get_text(strip=True)
            if text:
                blocks.append({
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {"rich_text": create_rich_text(text)}
                })
            return

        if tag_name == "h3":
            text = node.get_text(strip=True)
            if text:
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {"rich_text": create_rich_text(text)}
                })
            return

        if tag_name in ["h4", "h5", "h6"]:
            text = node.get_text(strip=True)
            if text:
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {"rich_text": create_rich_text(text)}
                })
            return

        # 3. 引用區塊
        if tag_name == "blockquote":
            text = node.get_text(strip=True)
            if text:
                blocks.append({
                    "object": "block",
                    "type": "quote",
                    "quote": {"rich_text": create_rich_text(text)}
                })
            return

        # 4. 程式碼區塊
        if tag_name in ["pre", "code"]:
            text = node.get_text()
            if text.strip():
                blocks.append({
                    "object": "block",
                    "type": "code",
                    "code": {
                        "rich_text": create_rich_text(text),
                        "language": "plain text"
                    }
                })
            return

        # 5. 分隔線
        if tag_name == "hr":
            blocks.append({
                "object": "block",
                "type": "divider",
                "divider": {}
            })
            return

        # 6. 無序清單 (ul > li)
        if tag_name == "ul":
            for li in node.find_all("li", recursive=False):
                li_text = li.get_text(strip=True)
                if li_text:
                    blocks.append({
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {"rich_text": create_rich_text(li_text)}
                    })
            return

        # 7. 有序清單 (ol > li)
        if tag_name == "ol":
            for li in node.find_all("li", recursive=False):
                li_text = li.get_text(strip=True)
                if li_text:
                    blocks.append({
                        "object": "block",
                        "type": "numbered_list_item",
                        "numbered_list_item": {"rich_text": create_rich_text(li_text)}
                    })
            return

        # 8. 段落與一般容器 (p, div, section, article 等)
        # 若內部包含 img，必須把 img 分離出來獨立成 image block
        imgs = node.find_all("img")
        if imgs:
            for child in node.children:
                process_node(child)
            return

        # 純文字段落
        text = node.get_text(strip=True)
        if text:
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {"rich_text": create_rich_text(text)}
            })

    # 開始遍歷主節點的直接子元素
    for child in content_soup.children:
        process_node(child)

    # 避免文章過空時完全沒有 Block
    if not blocks:
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {"rich_text": create_rich_text("(本文章無內文或僅含多媒體)")}
        })

    return blocks


class NotionMigrator:
    def __init__(self):
        self.client = Client(auth=Config.NOTION_TOKEN)
        self.database_id = Config.NOTION_DATABASE_ID
        self.schema_map = {}
        self._detect_database_schema()

    def _detect_database_schema(self):
        """
        自動探測使用者 Notion Database 的屬性名稱與型別，
        避免使用者欄位名稱稍有不同 (例如 'Name' vs 'Title', 'Date' vs '發布日期') 造成寫入失敗。
        """
        try:
            db_info = self.client.databases.retrieve(database_id=self.database_id)
            props = db_info.get("properties", {})
            
            # 若為新版 Notion API (Data Sources 架構)，從 data_sources 讀取屬性
            if not props and db_info.get("data_sources"):
                ds_id = db_info["data_sources"][0]["id"]
                ds_info = self.client.data_sources.retrieve(data_source_id=ds_id)
                props = ds_info.get("properties", {})

            for name, prop in props.items():
                p_type = prop.get("type")
                if p_type == "title" and "title" not in self.schema_map:
                    self.schema_map["title"] = name
                elif p_type == "date" and "date" not in self.schema_map:
                    self.schema_map["date"] = name
                elif p_type == "select" and "category" not in self.schema_map:
                    self.schema_map["category"] = name
                elif p_type == "multi_select" and "tags" not in self.schema_map:
                    self.schema_map["tags"] = name
                elif p_type == "url" and "url" not in self.schema_map:
                    self.schema_map["url"] = name

            # 確保 title 欄位必然存在
            if "title" not in self.schema_map:
                for cand in ["Name", "Title", "標題", "名稱"]:
                    if cand in props:
                        self.schema_map["title"] = cand
                        break
                else:
                    self.schema_map["title"] = "Name"

            print("📋 已成功探測 Notion 資料庫結構：")
            for role, col_name in self.schema_map.items():
                print(f"  - [{role.upper()}] 欄位對應至: '{col_name}'")
        except Exception as e:
            print(f"⚠️ 讀取 Notion 資料庫屬性失敗，將使用預設欄位名稱: {e}")
            self.schema_map = {
                "title": "Name",
                "date": "Date",
                "category": "Category",
                "tags": "Tags",
                "url": "Original URL"
            }

    def create_page(self, article_data: dict, blocks: list[dict]) -> dict:
        """
        在 Notion Database 建立新文章頁面，並分批寫入 Blocks (Notion 一次最多寫入 100 個 Blocks)
        """
        title = article_data.get("title", "無標題文章")
        date_str = article_data.get("date")
        category = article_data.get("category", "未分類")
        tags = article_data.get("tags", [])
        original_url = article_data.get("url", "")

        # 建立 Database 屬性字典
        properties = {}

        # 1. Title
        title_col = self.schema_map.get("title", "Title")
        properties[title_col] = {
            "title": create_rich_text(title)
        }

        # 2. Date
        if "date" in self.schema_map and date_str:
            date_col = self.schema_map["date"]
            properties[date_col] = {
                "date": {"start": date_str}
            }

        # 3. Category
        if "category" in self.schema_map and category:
            cat_col = self.schema_map["category"]
            properties[cat_col] = {
                "select": {"name": category[:100]}
            }

        # 4. Tags
        if "tags" in self.schema_map and tags:
            tag_col = self.schema_map["tags"]
            properties[tag_col] = {
                "multi_select": [{"name": t[:100]} for t in tags[:10]]
            }

        # 5. Original URL
        if "url" in self.schema_map and original_url:
            url_col = self.schema_map["url"]
            properties[url_col] = {
                "url": original_url
            }

        # Notion API 限制：pages.create 的 children 最多只能傳入 100 個 blocks
        initial_blocks = blocks[:100]
        remaining_blocks = blocks[100:]

        # 建立頁面
        page = self.client.pages.create(
            parent={"database_id": self.database_id},
            properties=properties,
            children=initial_blocks
        )
        page_id = page["id"]

        # 若超過 100 個 blocks，使用 blocks.children.append 分批追加
        if remaining_blocks:
            batch_size = 100
            for i in range(0, len(remaining_blocks), batch_size):
                batch = remaining_blocks[i:i + batch_size]
                time.sleep(0.3)  # 遵守 Notion 速率限制
                self.client.blocks.children.append(
                    block_id=page_id,
                    children=batch
                )

        notion_url = page.get("url", f"https://www.notion.so/{page_id.replace('-', '')}")
        return {
            "page_id": page_id,
            "notion_url": notion_url
        }
