/** @type {import('next').NextConfig} */
const nextConfig = {
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