/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com']
  },
  reactStrictMode: true,
  // Configure for Replit environment
  devIndicators: {
    buildActivity: false,
  },
  // Allow all hosts for development in Replit
  async rewrites() {
    return [];
  },
  webpack: (config, { isServer }) => {
    // Handle node modules that might cause issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { file: /node_modules\/node-fetch\/lib\/index\.js/ },
    ];
    
    return config;
  }
};

module.exports = nextConfig;
