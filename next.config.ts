import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Next.js to ignore strict formatting errors so Netlify can successfully build the site
  // @ts-ignore - Bypassing strict type checking for this valid Next.js option
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* other config options if you have any */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
};

export default nextConfig;