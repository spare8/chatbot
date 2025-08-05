/** @type {import('next').NextConfig} */
const NextConfig = {
  reactStrictMode: true,

  // Bundle the DataGrid so its CSS is handled
  transpilePackages: ['@mui/x-data-grid'],

  // Disable ESM externals so CSS imports aren’t skipped
  experimental: {
    esmExternals: false,
  },

  webpack(config, {dev}) {
    if (dev) {
      // Use ONLY an in-memory cache in dev (no PackFileCache filesystem)
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/admin/assistant/:path*',
        destination: 'http://localhost:3001/assistant/:path*',
      },
    ];
  },
};

module.exports = NextConfig;
