import type { NextConfig } from "next";

const API_URL = (process.env.LARAVEL_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    /* Admins can paste image URLs from any https host. */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  /* Uploaded images live in the Laravel API; serve them same-origin under /uploads. */
  async rewrites() {
    return [{ source: "/uploads/:filename", destination: `${API_URL}/uploads/:filename` }];
  },
};

export default nextConfig;
