import os
import sys
from dotenv import load_dotenv

# 載入當前目錄下的 .env
load_dotenv()

class Config:
    PIXNET_SITEMAP_URL = os.getenv("PIXNET_SITEMAP_URL", "").strip()
    NOTION_TOKEN = os.getenv("NOTION_TOKEN", "").strip()
    NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID", "").strip()
    
    # 圖床設定 (imgbb, imgur 或 cloudinary)
    IMAGE_HOST_PROVIDER = os.getenv("IMAGE_HOST_PROVIDER", "imgbb").strip().lower()
    IMGBB_API_KEY = os.getenv("IMGBB_API_KEY", "").strip()
    IMGUR_CLIENT_ID = os.getenv("IMGUR_CLIENT_ID", "").strip()
    
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "").strip()
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "").strip()
    
    # 抓取間隔延遲 (避免被痞客邦阻擋 IP)
    REQUEST_DELAY_SECONDS = float(os.getenv("REQUEST_DELAY_SECONDS", "1.5"))

    @classmethod
    def validate(cls, dry_run=False):
        errors = []
        if not cls.PIXNET_SITEMAP_URL:
            errors.append("未設定 PIXNET_SITEMAP_URL (請在 .env 中填寫痞客邦 Sitemap 網址)")
        
        if not dry_run:
            if not cls.NOTION_TOKEN:
                errors.append("未設定 NOTION_TOKEN (請在 .env 中填寫 Notion Integration Secret Token)")
            if not cls.NOTION_DATABASE_ID:
                errors.append("未設定 NOTION_DATABASE_ID (請在 .env 中填寫目標 Notion Database ID)")
            
            if cls.IMAGE_HOST_PROVIDER == "imgbb":
                if not cls.IMGBB_API_KEY:
                    errors.append("選擇了 ImgBB 圖床，但未填寫 IMGBB_API_KEY (請至 https://api.imgbb.com 取得免費金鑰)")
            elif cls.IMAGE_HOST_PROVIDER == "imgur":
                if not cls.IMGUR_CLIENT_ID:
                    errors.append("選擇了 Imgur 圖床，但未填寫 IMGUR_CLIENT_ID")
            elif cls.IMAGE_HOST_PROVIDER == "cloudinary":
                if not (cls.CLOUDINARY_CLOUD_NAME and cls.CLOUDINARY_API_KEY and cls.CLOUDINARY_API_SECRET):
                    errors.append("選擇了 Cloudinary 圖床，但未完整填寫 CLOUDINARY 設定")
            else:
                errors.append(f"不支援的圖床提供商: {cls.IMAGE_HOST_PROVIDER} (支援: imgbb, imgur, cloudinary)")
        
        if errors:
            print("❌ 設定檔檢查失敗，請確認 .env 檔案配置：")
            for err in errors:
                print(f"  - {err}")
            return False
        return True
