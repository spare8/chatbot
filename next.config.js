/** @type {import('next').NextConfig} */
/* eslint-disable no-process-env */
const NextConfig = {
  reactStrictMode: true,

  // Bundle the DataGrid so its CSS is handled
  transpilePackages: ['@mui/x-data-grid'],
  env: {
    SERVER_URL: process.env.SERVER_URL,
    CLIENT_URL: process.env.CLIENT_URL,
    ADMIN_PANEL_TOKEN: process.env.ADMIN_PANEL_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MONGODB_URI: process.env.MONGODB_URI,
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
  redirects() {
    return [
      {
        source: '/',
        destination: '/how-to-use',
        permanent: true, // use false (307) during development if you prefer
      },
    ];
  },
};

module.exports = NextConfig;
