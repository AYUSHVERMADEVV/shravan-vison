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
};

module.exports = nextConfig;
