/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 快取 7 天，避免 Notion S3 連結頻繁失效
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co', // ImgBB 圖床
      },
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com', // Notion 官方 S3 上傳圖片
      },
      {
        protocol: 'https',
        hostname: 's3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Notion 內建 Unsplash
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary 圖床
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com', // Imgur 圖床
      },
      {
        protocol: 'https',
        hostname: 'pic.pimg.tw', // 痞客邦原圖
      },
      {
        protocol: 'https',
        hostname: '**.pixnet.net',
      },
    ],
  },
};

export default nextConfig;
