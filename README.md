# 痞客邦 (Pixnet) 文章全自動搬家至 Notion 工具

這是一套為痞客邦部落格量身打造的**全自動文章遷移爬蟲**。它可以讀取痞客邦 Sitemap，自動歷遍並解析所有公開文章、深度清洗內建廣告與側邊欄元件、將防盜鏈圖片自動轉存至免費圖床，並透過 Notion 官方 API 寫入指定的 Notion Database，最後輸出完整的 `redirect_map.json` 轉址清單。

---

## ✨ 核心功能特色

1. **Sitemap 遞迴遍歷**：自動解析痞客邦的 `sitemap.xml` 與 `sitemapindex` 子地圖，抓取所有 `/blog/post/` 文章。
2. **智慧內容清洗 (BeautifulSoup)**：
   - 徹底移除痞客邦內建廣告、Google Ads、推薦文章模組 (`#pixnet-relpost`)。
   - 移除作者卡片、留言板 (`.comment-box`)、分享工具列與追蹤腳本。
   - 保留乾淨的語意化標籤：各級標題 (`H1~H6`)、段落 (`p`)、清單 (`ul/ol`)、引用 (`blockquote`)、程式碼與圖片。
3. **圖片轉存與防盜鏈突破**：
   - 帶入 `Referer` 請求標頭下載痞客邦 `pic.pimg.tw` 圖片，突破 403 阻擋。
   - 自動上傳至 **Imgur** (預設免認證匿名圖床) 或 **Cloudinary**，取得持久化公開圖片網址並替換內文 `<img>`。
4. **Notion 官方 API 完美串接**：
   - 智慧探測 Notion Database 欄位屬性（相容繁中與英文欄位名稱）。
   - 支援文章標題、發布日期 (ISO-8601)、文章分類 (Select)、標籤 (Multi-select) 與原文連結。
   - 自動處理 Notion API 限制：單篇超過 100 個區塊自動分批追加 (`batch append`)、單個段落超過 2000 字元自動分片。
5. **斷點續傳與轉址紀錄**：
   - 執行時即時將搬移結果寫入 `redirect_map.json`。
   - 若中途網路中斷或停止，再次執行會**自動跳過已完成文章**，避免重複建立。

---

## 📁 專案檔案結構

```text
.
├── .env.example          # 環境變數範本檔
├── config.py             # 設定檔與參數驗證
├── pixnet_parser.py      # Sitemap 解析器與 BeautifulSoup HTML 內容清洗器
├── image_manager.py      # 圖片防盜鏈下載與圖床 API 上傳器
├── notion_service.py     # HTML 轉 Notion Blocks 核心轉換器與 Notion API 串接
├── main.py               # 主執行程式 (支援 CLI 參數、斷點續傳、進度條)
├── test_migration.py     # 單元測試腳本
├── requirements.txt      # Python 相依套件清單
└── redirect_map.json     # 執行後產生的 SEO 轉址對照表 (自動產生)
```

---

## ⚙️ 執行前準備 (API Key 與環境變數)

### 1. 複製環境設定檔
```bash
copy .env.example .env
```

### 2. 設定 Notion 整合權限 (Integration)
1. 前往 [Notion Integrations](https://www.notion.so/my-integrations) 點擊 **「+ New integration」**。
2. 命名為 `Pixnet Migrator`，關聯你的 Workspace，點擊 Save。
3. 複製產生的 **Internal Integration Secret**（格式為 `secret_xxxx...`），填入 `.env` 中的 `NOTION_TOKEN`。
4. 在 Notion 建立或打開你準備存放文章的 Database：
   - 建議欄位（程式會自動偵測型別對應）：
     - `Title` (型別: **Title**) - 標題
     - `Date` (型別: **Date**) - 發布日期
     - `Category` (型別: **Select**) - 分類
     - `Tags` (型別: **Multi-select**) - 標籤
     - `Original URL` (型別: **URL**) - 原文連結
5. **重要步驟（授權連接）**：
   - 在該 Notion Database 頁面右上角點擊 **`...`** (選單) -> 移至最下方 **`Connections`** (連線)。
   - 搜尋並選擇剛建立的 `Pixnet Migrator` 進行連接。
6. 取得 **Database ID**：
   - 複製資料庫連結（例如 `https://www.notion.so/myworkspace/a1b2c3d4e5f6...`?v=...）。
   - `a1b2c3d4e5f6...` 這段 32 碼英數字即為 `NOTION_DATABASE_ID`。

### 3. 設定免費圖床 API (首選推薦 ImgBB)

> **為什麼不建議 Imgur？**
> Imgur 近期對台灣與亞洲地區 IP 嚴格限制，註冊時強制要求國外手機門號簡訊驗證，且時常收不到驗證碼。因此我們首選推薦使用 **ImgBB** 或 **Cloudinary**。

- **【方案 A：首選推薦】ImgBB（10 秒搞定、完全免費、免手機驗證）**：
  1. 前往 [ImgBB API 官網 (https://api.imgbb.com/)](https://api.imgbb.com/)。
  2. 點擊藍色按鈕 **「取得 API 金鑰 (Get API Key)」**。
  3. 直接使用 **Google 帳號一鍵登入**（無須輸入任何手機號碼）。
  4. 登入後點擊「新增 (Add)」即可複製 32 碼 API 金鑰。
  5. 填入 `.env` 中的 `IMGBB_API_KEY`，並確認 `IMAGE_HOST_PROVIDER=imgbb`。

- **【方案 B】Cloudinary（老牌雲端圖床、支援 Google 一鍵登入）**：
  1. 前往 [Cloudinary](https://cloudinary.com/) 免費註冊（可使用 Google 帳號）。
  2. 登入 Dashboard 後複製 `Cloud name`、`API Key` 與 `API Secret`。
  3. 將 `.env` 的 `IMAGE_HOST_PROVIDER` 改為 `cloudinary` 並填入對應憑證。

- **【方案 C】Imgur**：
  - 若您先前已有 Imgur 帳號，亦可前往 [Imgur 註冊應用程式](https://api.imgur.com/oauth2/addclient) 獲取 Client ID。

### 4. 設定痞客邦 Sitemap 網址
在 `.env` 中設定 `PIXNET_SITEMAP_URL`：
```env
PIXNET_SITEMAP_URL=https://<你的痞客邦帳號>.pixnet.net/sitemap.xml
```

---

## 🚀 安裝與執行方式

### 安裝相依套件
```bash
pip install -r requirements.txt
```

### 1. 乾跑模式 (Dry Run 測試)
僅抓取並在終端機輸出文章解析清洗結果，不上傳至圖床與 Notion：
```bash
python main.py --limit 1 --dry-run
```

### 2. 單篇實測搬移
搬移前 1 篇文章至 Notion，確認排版與圖片是否符合預期：
```bash
python main.py --limit 1
```

### 3. 全量自動搬家
自動依序處理 Sitemap 中的所有文章：
```bash
python main.py
```

### 4. 常用參數說明
- `--sitemap <URL>`：臨時指定其他 Sitemap 網址。
- `--limit <N>`：只搬移前 N 篇文章（如 `--limit 10`）。
- `--force`：強制重新搬移已存在於 `redirect_map.json` 中的文章。
- `--dry-run`：不進行實體寫入與上傳，純驗證爬蟲解析效果。

---

## 🗺️ 轉址清單格式 (`redirect_map.json`)

腳本執行完畢後會產生 `redirect_map.json`，結構如下：

```json
{
  "https://myblog.pixnet.net/blog/post/12345678": {
    "title": "我的第一篇痞客邦文章",
    "notion_page_id": "c7a8d509-3c12-4f36-9ab3-5c8e434e32d1",
    "notion_url": "https://www.notion.so/c7a8d5093c124f369ab35c8e434e32d1",
    "status": "success",
    "migrated_at": "2026-11-04T14:40:00.123456"
  }
}
```

> **後續 SEO 轉址應用**：
> 未來若要使用 Cloudflare Workers、Netlify Redirects 或 Nginx 將舊網址進行 301 永久轉址，可直接讀取此 JSON 檔，將訪客與 Google 爬蟲無縫導向 Notion 或由 Notion 驅動的靜態網站（例如 Fruition, Super.so 或 Next.js）。
