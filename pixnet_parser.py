import re
import sys
import xml.etree.ElementTree as ET
from urllib.parse import urlparse
from datetime import datetime
import requests
from bs4 import BeautifulSoup, Comment

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

try:
    import dateutil.parser
except ImportError:
    dateutil = None

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
}

def fetch_sitemap_urls(sitemap_url: str) -> list[str]:
    """
    抓取痞客邦 Sitemap，遞迴處理 sitemapindex 與 urlset，
    並過濾出文章網址 (通常包含 /blog/post/)。
    """
    article_urls = []
    print(f"🔍 正在解析 Sitemap: {sitemap_url}")
    try:
        resp = requests.get(sitemap_url, headers=DEFAULT_HEADERS, timeout=15)
        resp.raise_for_status()
        
        # 移除命名空間以簡化 XML 解析
        xml_content = re.sub(r' xmlns="[^"]+"', '', resp.text, count=1)
        root = ET.fromstring(xml_content.encode('utf-8'))
        
        # 1. 檢查是否為 Sitemap Index (<sitemapindex>)
        sub_sitemaps = root.findall(".//sitemap/loc")
        if sub_sitemaps:
            print(f"📑 發現包含 {len(sub_sitemaps)} 個子 Sitemap，開始逐一展開...")
            for sitemap_node in sub_sitemaps:
                sub_url = sitemap_node.text.strip()
                article_urls.extend(fetch_sitemap_urls(sub_url))
        else:
            # 2. 為標準 URL 列表 (<urlset>)
            urls = root.findall(".//url/loc")
            for url_node in urls:
                loc = url_node.text.strip()
                # 僅保留痞客邦部落格文章網址 (例如 /blog/post/123 或 /blog/posts/123)，排除首頁與分類列表
                if re.search(r'/blog/posts?/\d+', loc):
                    article_urls.append(loc)
                elif ("/blog/post/" in loc or "/blog/posts/" in loc) and "/categories/" not in loc and not loc.rstrip("/").endswith("/blog"):
                    article_urls.append(loc)
                    
    except Exception as e:
        print(f"⚠️ 解析 Sitemap 發生錯誤 ({sitemap_url}): {e}")

    # 去除重複網址並保持順序
    seen = set()
    deduped = []
    for u in article_urls:
        if u not in seen:
            seen.add(u)
            deduped.append(u)
    return deduped

def clean_article_soup(content_div: BeautifulSoup) -> BeautifulSoup:
    """
    清理痞客邦 HTML 內文：
    移除廣告代碼、痞客邦推薦模組、作者卡片、追蹤像素與冗餘標籤，
    只保留純淨的文章圖文標籤。
    """
    # 移除 HTML 註解
    for comment in content_div.find_all(string=lambda text: isinstance(text, Comment)):
        comment.extract()

    # 移除內嵌腳本、樣式與隱藏元素
    for tag in content_div.find_all(["script", "style", "noscript"]):
        tag.decompose()

    # 痞客邦常見的內建廣告、推薦文章與非內文容器選擇器
    junk_selectors = [
        "#pixnet-relpost",
        ".pixnet-relpost",
        ".article-keyword-tag",
        ".pixnet-author-info",
        ".author-info",
        ".comment-box",
        "#comment-box",
        "#comment-area",
        ".social-tools",
        ".article-footer",
        ".trackback",
        ".google-auto-placed",
        "ins.adsbygoogle",
        "div[id*='ad']",
        "div[id*='banner']",
        "div[class*='ad-']",
        "div[class*='ad_']",
        "div[class*='banner']",
        "div[class*='advertisement']",
    ]

    for sel in junk_selectors:
        for element in content_div.select(sel):
            element.decompose()

    # 移除空的無意義 div 或 p
    for element in content_div.find_all(["p", "div"]):
        # 若沒有文字且沒有 img，則視為空標籤移除
        if not element.get_text(strip=True) and not element.find_all("img"):
            element.decompose()

    return content_div

def parse_iso_date(date_text: str) -> str:
    """
    將痞客邦常見日期格式解析為標準 ISO-8601 (YYYY-MM-DD)
    """
    if not date_text:
        return datetime.now().strftime("%Y-%m-%d")
    clean_text = date_text.strip()
    # 移除常見中文前綴
    clean_text = re.sub(r'^(發布時間|發表日期|日期)\s*[:：]?\s*', '', clean_text).strip()
    
    # 優先嘗試 dateutil
    if dateutil:
        try:
            dt = dateutil.parser.parse(clean_text, fuzzy=True)
            return dt.strftime("%Y-%m-%d")
        except Exception:
            pass

    # 正則提取常見 YYYY-MM-DD 或 YYYY/MM/DD 或 YYYY.MM.DD
    match = re.search(r'(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})', clean_text)
    if match:
        year, month, day = match.groups()
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"

    return datetime.now().strftime("%Y-%m-%d")

def scrape_pixnet_article(article_url: str) -> dict:
    """
    抓取痞客邦單篇文章，解析出標題、發布日期、分類、標籤與清洗後的內文 DOM
    """
    headers = DEFAULT_HEADERS.copy()
    domain = urlparse(article_url).netloc
    headers["Referer"] = f"https://{domain}/"

    resp = requests.get(article_url, headers=headers, timeout=20)
    resp.encoding = resp.apparent_encoding or "utf-8"
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")

    # 1. 抓取標題
    title = ""
    title_el = (
        soup.select_one("li.title a")
        or soup.select_one("h2.title")
        or soup.select_one(".article-title")
        or soup.select_one("h1.article-title")
        or soup.select_one("meta[property='og:title']")
    )
    if title_el:
        if title_el.name == "meta":
            title = title_el.get("content", "").strip()
        else:
            title = title_el.get_text(strip=True)
    if not title and soup.title:
        title = soup.title.get_text(strip=True)
    # 移除痞客邦常見後綴 ":: 痞客邦 ::"
    title = re.sub(r'::\s*痞客邦.*$', '', title).strip()
    title = re.sub(r'@\s*.*?::.*$', '', title).strip()

    # 2. 抓取發布日期
    publish_date_str = ""
    date_el = (
        soup.select_one("meta[property='og:article:published_time']")
        or soup.select_one("meta[property='article:published_time']")
        or soup.select_one("span.publish")
        or soup.select_one(".article-date")
        or soup.select_one("span.date")
        or soup.select_one("div.date")
    )
    if date_el:
        if date_el.name == "meta":
            publish_date_str = date_el.get("content", "").strip()
        else:
            publish_date_str = date_el.get_text(strip=True)
    iso_date = parse_iso_date(publish_date_str)

    # 3. 抓取分類
    category = "未分類"
    cat_el = (
        soup.select_one("ul.refer li a")
        or soup.select_one(".article-category a")
        or soup.select_one("a.category")
        or soup.select_one("dd.category a")
    )
    if cat_el:
        cat_text = cat_el.get_text(strip=True)
        if cat_text:
            category = cat_text.replace(",", " ")  # Notion select 不支援逗號

    # 4. 抓取標籤
    tags = []
    tag_elements = soup.select("div.article-keyword-tag a, ul.article-tags a, span.tags a")
    for tel in tag_elements:
        tag_text = tel.get_text(strip=True).replace(",", " ")
        if tag_text and tag_text not in tags:
            tags.append(tag_text)
    
    # 5. 抓取主要內文容器
    content_container = (
        soup.select_one("div.article-content-inner")
        or soup.select_one("div.article-content")
        or soup.select_one("div.inner-content")
        or soup.select_one("#article-content")
        or soup.select_one("div.content")
    )

    if not content_container:
        raise ValueError(f"無法在頁面找到痞客邦文章內文容器: {article_url}")

    # 清洗內容
    cleaned_content_soup = clean_article_soup(content_container)

    return {
        "url": article_url,
        "title": title or "無標題文章",
        "date": iso_date,
        "category": category,
        "tags": tags[:10],  # 限制標籤數量避免超過 Notion 上限
        "content_soup": cleaned_content_soup
    }
