import os
import io
import time
import requests
from bs4 import BeautifulSoup
from config import Config

class ImageManager:
    """
    負責下載痞客邦防盜鏈圖片並轉存至第三方圖床 (ImgBB, Imgur 或 Cloudinary)
    """
    def __init__(self):
        self.provider = Config.IMAGE_HOST_PROVIDER
        self.imgbb_api_key = Config.IMGBB_API_KEY
        self.imgur_client_id = Config.IMGUR_CLIENT_ID
        self.cache = {}  # 網址快取：original_url -> new_url
        
        # 若為 Cloudinary，初始化設定
        if self.provider == "cloudinary":
            import cloudinary
            cloudinary.config(
                cloud_name=Config.CLOUDINARY_CLOUD_NAME,
                api_key=Config.CLOUDINARY_API_KEY,
                api_secret=Config.CLOUDINARY_API_SECRET,
                secure=True
            )

    def download_image(self, img_url: str, referer: str = "https://www.pixnet.net/") -> bytes | None:
        """
        下載原始圖片，帶入 Referer 偽裝以突破痞客邦防盜鏈
        """
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
            "Referer": referer,
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        }
        try:
            resp = requests.get(img_url, headers=headers, timeout=20)
            if resp.status_code == 200 and resp.content:
                return resp.content
            print(f"⚠️ 圖片下載失敗 [HTTP {resp.status_code}]: {img_url}")
            return None
        except Exception as e:
            print(f"⚠️ 下載圖片發生例外 ({img_url}): {e}")
            return None

    def upload_to_imgbb(self, img_bytes: bytes) -> str | None:
        """
        上傳圖片至 ImgBB (免費 API，免手機號碼驗證，支援 Google 一鍵登入)
        API 申請：https://api.imgbb.com/
        """
        if not self.imgbb_api_key:
            print("⚠️ 未設定 IMGBB_API_KEY，無法上傳至 ImgBB")
            return None

        url = "https://api.imgbb.com/1/upload"
        params = {"key": self.imgbb_api_key}
        
        try:
            resp = requests.post(
                url,
                params=params,
                files={"image": img_bytes},
                timeout=30
            )
            data = resp.json()
            if resp.status_code == 200 and data.get("success"):
                return data["data"]["url"]
            else:
                error_msg = data.get("error", {}).get("message", resp.text)
                print(f"⚠️ ImgBB 上傳失敗: {error_msg}")
                return None
        except Exception as e:
            print(f"⚠️ ImgBB 上傳發生例外: {e}")
            return None

    def upload_to_imgur(self, img_bytes: bytes) -> str | None:
        """
        上傳圖片至 Imgur (使用 Client-ID 匿名上傳)
        """
        if not self.imgur_client_id:
            print("⚠️ 未設定 IMGUR_CLIENT_ID，無法上傳至 Imgur")
            return None

        url = "https://api.imgur.com/3/image"
        headers = {"Authorization": f"Client-ID {self.imgur_client_id}"}
        
        try:
            resp = requests.post(
                url,
                headers=headers,
                files={"image": img_bytes},
                timeout=30
            )
            data = resp.json()
            if resp.status_code == 200 and data.get("success"):
                new_link = data["data"]["link"]
                return new_link
            else:
                error_msg = data.get("data", {}).get("error", resp.text)
                print(f"⚠️ Imgur 上傳失敗: {error_msg}")
                return None
        except Exception as e:
            print(f"⚠️ Imgur 上傳發生例外: {e}")
            return None

    def upload_to_cloudinary(self, img_bytes: bytes) -> str | None:
        """
        上傳圖片至 Cloudinary
        """
        try:
            import cloudinary.uploader
            res = cloudinary.uploader.upload(
                io.BytesIO(img_bytes),
                folder="pixnet_migration",
                resource_type="image"
            )
            return res.get("secure_url")
        except Exception as e:
            print(f"⚠️ Cloudinary 上傳發生例外: {e}")
            return None

    def rehost_image(self, img_url: str, page_url: str) -> str:
        """
        將圖片下載並重新轉存至新圖床，若成功則傳回新網址，失敗則保留原始網址
        """
        # 排除 data:image 或非 http 圖片
        if not img_url or not img_url.startswith("http"):
            return img_url
            
        # 檢查快取
        if img_url in self.cache:
            return self.cache[img_url]

        # 若已經是目標圖床的網址，跳過上傳
        if "i.imgur.com" in img_url or "res.cloudinary.com" in img_url or "i.ibb.co" in img_url:
            return img_url

        # 下載防盜鏈圖片
        img_bytes = self.download_image(img_url, referer=page_url)
        if not img_bytes:
            return img_url

        # 上傳到對應圖床
        new_url = None
        if self.provider == "imgbb":
            new_url = self.upload_to_imgbb(img_bytes)
        elif self.provider == "imgur":
            new_url = self.upload_to_imgur(img_bytes)
        elif self.provider == "cloudinary":
            new_url = self.upload_to_cloudinary(img_bytes)

        if new_url:
            self.cache[img_url] = new_url
            time.sleep(0.5)  # 避免圖床 API 速率限制
            return new_url
        else:
            return img_url

    def process_content_images(self, content_soup: BeautifulSoup, page_url: str) -> BeautifulSoup:
        """
        遍歷清洗後的內文，替換所有 <img> 的防盜鏈網址
        """
        img_tags = content_soup.find_all("img")
        if not img_tags:
            return content_soup

        print(f"🖼️ 發現 {len(img_tags)} 張內文圖片，開始轉存處理...")
        for img in img_tags:
            # 痞客邦有時會使用 data-src 或 original 等延遲加載屬性
            src = (
                img.get("data-src")
                or img.get("data-original")
                or img.get("src")
            )
            if not src:
                continue

            # 修正相對路徑或缺少協定的網址
            if src.startswith("//"):
                src = "https:" + src

            new_url = self.rehost_image(src, page_url)
            img["src"] = new_url
            # 清除延遲加載屬性，確保 HTML 乾淨
            if "data-src" in img.attrs:
                del img["data-src"]
            if "data-original" in img.attrs:
                del img["data-original"]

        return content_soup
