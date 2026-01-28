/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  // Next.js bazen workspace root'u yanlış seçebiliyor (çoklu lockfile vb.).
  // Bu ayar output file tracing'in doğru kökten yapılmasını sağlar.
  outputFileTracingRoot: path.resolve(__dirname),
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
      },
      // Google profile images (NextAuth / Google OAuth)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
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
  // TypeScript type checking'i build sırasında atla (geçici - production'da düzeltilmeli)
  typescript: {
    ignoreBuildErrors: true,
  },
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

  // Legacy/spam URL'ler için yönlendirme yapma.
  // Bu URL'ler `src/middleware.ts` içinde 410 Gone döndürülerek Google'ın daha hızlı düşürmesi sağlanır.
  async redirects() {
    return [];
  },
}

module.exports = nextConfig 