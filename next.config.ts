import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable all checks for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // Security headers (Clerk-compatible)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.clerk.dev https://clerk.dev https://accounts.google.com https://*.clerk.com https://*.clerk.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: https://images.clerk.dev https://img.clerk.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.clerk.dev https://clerk.dev https://api.clerk.com https://*.clerk.com https://*.clerk.dev https://generativelanguage.googleapis.com https://accounts.google.com; frame-src https://accounts.google.com https://*.clerk.com https://*.clerk.dev;",
          },
        ],
      },
    ];
  },

  // Server external packages (updated from deprecated option)
  serverExternalPackages: ['mongoose'],

  // Image optimization
  images: {
    domains: ['images.clerk.dev', 'img.clerk.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Experimental features (only stable ones)
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', 'lucide-react'],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }

    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource',
    });

    return config;
  },
};

export default nextConfig;
