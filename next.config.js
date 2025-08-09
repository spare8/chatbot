/** @type {import('next').NextConfig} */
const NextConfig = {
  reactStrictMode: true,

  // Bundle the DataGrid so its CSS is handled
  transpilePackages: ['@mui/x-data-grid'],

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
