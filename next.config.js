/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      }
    ],
    unoptimized: true
  },
  // Backup klasörlerini hariç tut
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.watchOptions = {
      ignored: ['**/backup_*/**', '**/backup_new/**']
    };
    return config;
  },
}

module.exports = nextConfig 