/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Optimize for production
  swcMinify: true,
  
  // Webpack configuration to handle chunk loading issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix for app-pages-internals.js 404 errors
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Handle environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL,
  },
  
  // Configure build output
  // Note: 'standalone' output is disabled for Vercel compatibility
  // Vercel handles the build output automatically
  // output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  
  // Security headers
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
        ],
      },
    ];
  },
};

export default nextConfig;
