import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Disable TypeScript checking during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Environment variables
  env: {
    CUSTOM_KEY: "123456",
    NEXT_PUBLIC_API_URL: "https://grub-six.vercel.app",
  },

  // Image optimization
  images: {
    domains: ["localhost", "127.0.0.1"],
    formats: ["image/webp", "image/avif"],
  },

  // Enable API routes and server-side features for Vercel
  trailingSlash: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Compression
  compress: true,

  // Development configuration
  ...(process.env.NODE_ENV === "development" &&
    {
      // Enable React strict mode in development
    }),

  // Production configuration
  ...(process.env.NODE_ENV === "production" && {
    // Enable React strict mode in production
    reactStrictMode: true,

    // Optimize for production
    compiler: {
      removeConsole: {
        exclude: ["error"],
      },
    },
  }),
};

export default nextConfig;
