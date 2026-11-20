import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Crucially, we need to tell TypeScript to ignore errors during build as well
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
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
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', '@radix-ui/react-tabs'],
  },
};

export default nextConfig;