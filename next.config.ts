import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "resplendent-solace-production.up.railway.app",
        pathname: "/uploads/**",
      },
    ],
    // In local dev, allow images from the backend (localhost:4000) without proxying
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
