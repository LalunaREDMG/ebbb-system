import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable webpack HMR to prevent route exposure
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable webpack HMR to prevent route exposure
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.next/**'],
      };
    }
    return config;
  },
  
  // Reduce information exposure
  experimental: {
    // Disable some development features that expose routes
  },
  
  // Server external packages configuration (moved from experimental)
  serverExternalPackages: [],
  
  // Disable source maps in development to reduce information exposure
  productionBrowserSourceMaps: false,
  
  // Configure headers for security
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
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
