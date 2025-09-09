/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  eslint: {
    // Disable ESLint during builds (not recommended for production)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript checking
    ignoreBuildErrors: false,
  }
};

module.exports = nextConfig;