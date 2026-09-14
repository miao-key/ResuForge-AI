import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 性能优化
  reactStrictMode: true,
  
  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  
  // 实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: ['lucide-react', '@radix-ui/react-label', '@radix-ui/react-slot'],
  },
  
  // 输出独立 CSS
  sassOptions: {
    includePaths: ['./styles'],
  },
};

export default nextConfig;
