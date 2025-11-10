import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/:path*", // proxy backend
      },
    ];
  },

  // ✅ Cho phép tải ảnh từ mọi domain (http/https)
  images: {
    // Nếu bạn chỉ dùng https, có thể bỏ block http bên dưới
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    // tuỳ chọn khuyến nghị cho chất lượng & cỡ responsive
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cho phép SVG bên ngoài (cân nhắc CSP an toàn)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline';",
  },
 allowedDevOrigins: [
    '36.50.134.216',
    '36.50.134.216:3000', // thử cả host:port nếu cần
    '*.local',             // ví dụ wildcard
  ],
  webpack: (config: any, { isServer }) => {
    // ⚙️ Bỏ qua module 'fs' khi build client-side (một số lib như Mapbox Directions tham chiếu 'fs')
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
      };
    }
    return config;
  },
    typescript: {
    ignoreBuildErrors: true,
  },
   eslint: {
    ignoreDuringBuilds: true,
  },
 
};

export default nextConfig;
