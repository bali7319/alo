/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.paytr.com',
        pathname: '/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Base64 resimler için unoptimized kullanılacak
    unoptimized: false, // Component seviyesinde kontrol edilecek
  },
  // Backup klasörlerini hariç tut
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.watchOptions = {
      ignored: ['**/backup_*/**', '**/backup_new/**']
    };
    return config;
  },
  // Compression
  compress: true,
  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  // Experimental özellikler
  experimental: {
    // Server actions için optimize et
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // RSC cache size limitini artır (Single item size exceeds maxSize hatası için)
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  // On-demand entries cache ayarları (Single item size exceeds maxSize hatası için)
  onDemandEntries: {
    // Cache süresini artır
    maxInactiveAge: 60 * 60 * 1000, // 1 saat
    pagesBufferLength: 5,
  },
  // Cache memory size limitini artır (Single item size exceeds maxSize hatası için)
  // Not: Bu geçici bir çözümdür, asıl çözüm resim boyutlarını küçültmektir
  cacheMaxMemorySize: 0, // 0 = sınırsız (geçici çözüm)
}

module.exports = nextConfig 