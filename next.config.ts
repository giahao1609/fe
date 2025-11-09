// next.config.ts
import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/:path*", // proxy backend
      },
    ];
  },

  webpack: (config: WebpackConfig, { isServer }) => {
    // ⚙️ Bỏ qua module 'fs' khi build client-side (Mapbox Directions có dùng fs)
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
