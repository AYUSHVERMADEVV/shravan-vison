/** @type {import('next').NextConfig} */
const nextConfig = {
  // For static export, use 'export'. For server-side rendering, comment this out
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Add trailing slash to improve routing
  trailingSlash: true,
  // Disable React StrictMode in production for better performance
  reactStrictMode: process.env.NODE_ENV !== 'production',
  // Fix for critical dependency error with @supabase/realtime-js
  webpack: (config, { isServer }) => {
    // Add external modules that should not be bundled
    if (isServer) {
      // For server-side builds, mark the module as external
      config.externals = [...(config.externals || []), '@supabase/realtime-js'];
    } else {
      // For client-side builds, add a fallback
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@supabase/realtime-js': false
      };
    }
    return config;
  }
};

module.exports = nextConfig;
