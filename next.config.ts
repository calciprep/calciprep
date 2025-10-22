import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* other config options if you have any */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        // You can optionally specify port and pathname if needed, but hostname is usually sufficient
        // port: '',
        // pathname: '/a/**', // Example if URLs always start with /a/
      },
      // Add other hostnames here if you load images from other external sources
    ],
  },
};

export default nextConfig;
