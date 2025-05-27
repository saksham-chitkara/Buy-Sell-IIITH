import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: process.env.NEXT_PUBLIC_API_PORT || "5000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "buy-sell-iiith.onrender.com",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
