import unittest
from bs4 import BeautifulSoup
from pixnet_parser import clean_article_soup, parse_iso_date
from notion_service import html_to_notion_blocks, create_rich_text

class TestPixnetMigration(unittest.TestCase):
    def test_clean_article_soup(self):
        html = """
        <div class="article-content-inner">
            <script>var x = 1;</script>
            <div id="pixnet-relpost">推薦文章</div>
            <div class="pixnet-author-info">作者資訊</div>
            <div class="google-auto-placed"><ins class="adsbygoogle"></ins></div>
            <h2>測試標題 1</h2>
            <p>這是一段乾淨的內文。</p>
            <div class="comment-box">留言區塊</div>
            <img src="https://pic.pimg.tw/test/12345.jpg" />
        </div>
        """
        soup = BeautifulSoup(html, "lxml")
        container = soup.select_one(".article-content-inner")
        cleaned = clean_article_soup(container)
        
        # 驗證廣告與多餘組件已被移除
        self.assertIsNone(cleaned.select_one("#pixnet-relpost"))
        self.assertIsNone(cleaned.select_one(".pixnet-author-info"))
        self.assertIsNone(cleaned.select_one(".comment-box"))
        self.assertIsNone(cleaned.select_one("script"))
        self.assertIsNone(cleaned.select_one(".adsbygoogle"))
        
        # 驗證保留正常內容
        self.assertIsNotNone(cleaned.select_one("h2"))
        self.assertIsNotNone(cleaned.select_one("p"))
        self.assertIsNotNone(cleaned.select_one("img"))

    def test_html_to_notion_blocks(self):
        html = """
        <div>
            <h2>第一章</h2>
            <p>段落一的說明文字。</p>
            <ul>
                <li>清單項目 A</li>
                <li>清單項目 B</li>
            </ul>
            <blockquote>引言區塊內容</blockquote>
            <img src="https://i.imgur.com/example.jpg" />
        </div>
        """
        soup = BeautifulSoup(html, "lxml")
        blocks = html_to_notion_blocks(soup)
        
        types = [b["type"] for b in blocks]
        self.assertIn("heading_2", types)
        self.assertIn("paragraph", types)
        self.assertIn("bulleted_list_item", types)
        self.assertIn("quote", types)
        self.assertIn("image", types)

    def test_rich_text_chunking(self):
        # 測試超過 2000 字元的自動切片
        long_text = "A" * 4500
        chunks = create_rich_text(long_text)
        self.assertEqual(len(chunks), 3)
        self.assertEqual(len(chunks[0]["text"]["content"]), 2000)
        self.assertEqual(len(chunks[1]["text"]["content"]), 2000)
        self.assertEqual(len(chunks[2]["text"]["content"]), 500)

    def test_parse_iso_date(self):
        self.assertEqual(parse_iso_date("2023-08-15 14:20:00"), "2023-08-15")
        self.assertEqual(parse_iso_date("發布時間：2021/12/31"), "2021-12-31")
        self.assertEqual(parse_iso_date("2020.05.01"), "2020-05-01")

if __name__ == "__main__":
    unittest.main()
