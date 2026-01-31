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
    // Production server CPU cannot load sharp (linux-x64 v2 requirement),
    // which breaks `/_next/image` with 500. Disable optimization globally.
    unoptimized: process.env.NODE_ENV === 'production',
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
  compiler: {
    // Production build'de console.* çağrılarını kaldır (error/warn kalsın)
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
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
    return [
      // Broken/legacy placeholder.jpg paths -> SVG placeholder.
      // (These redirects work only if the .jpg file doesn't exist in /public.)
      {
        source: '/images/placeholder.jpg',
        destination: '/images/placeholder.svg',
        permanent: false,
      },
      {
        source: '/images/listings/placeholder.jpg',
        destination: '/images/placeholder.svg',
        permanent: false,
      },
    ];
  },

  async headers() {
    const isProd = process.env.NODE_ENV === 'production'

    // CSP: "kırmadan" başlangıç seviyesi (PayTR iframe + resizer script dahil).
    // Zamanla tighten edilebilir (nonce/strict-dynamic vb.).
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      // PayTR ödeme sayfaları için iframe + form action gerekli
      "frame-src 'self' https://www.paytr.com",
      "form-action 'self' https://www.paytr.com",
      // Next + PayTR resizer
      `script-src 'self'${isProd ? '' : " 'unsafe-eval'"} 'unsafe-inline' https://www.paytr.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      `connect-src 'self'${isProd ? ' https:' : ' https: ws: wss:'}`,
      "upgrade-insecure-requests",
    ].join('; ')

    const securityHeaders = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
      { key: 'Origin-Agent-Cluster', value: '?1' },
      ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
    ]

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig 