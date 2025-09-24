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
    CUSTOM_KEY: "grub-frontend",
  },

  // Image optimization
  images: {
    domains: ["localhost", "127.0.0.1"],
    formats: ["image/webp", "image/avif"],
  },

  // Note: Headers don't work with static export, handled by Netlify headers

  // Note: Redirects don't work with static export, handled by Netlify redirects

  // Note: Rewrites don't work with static export, handled by Netlify redirects

  // Output configuration for Netlify
  output: "export",
  trailingSlash: true,
  outputFileTracingRoot: __dirname,

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
