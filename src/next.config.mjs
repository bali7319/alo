/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compression - Next.js 15'te varsayılan olarak açık ama açıkça belirtelim
  compress: true,
  
  // Production optimizasyonları
  poweredByHeader: false, // X-Powered-By header'ını kaldır (güvenlik)
  
  // CDN support - Static asset'ler için CDN kullanımı (opsiyonel)
  // CDN kullanmak için assetPrefix'i ayarlayın:
  // assetPrefix: process.env.CDN_URL || '',
  // Örnek: assetPrefix: 'https://cdn.alo17.tr',
  
  // Router prefetch optimizasyonu - Çok fazla prefetch isteği önlemek için
  // Sadece görünür linkler için prefetch yap
  // Bu, kategori sayfaları için yapılan prefetch isteklerini azaltır
  reactStrictMode: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Experimental features for performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Optimize CSS loading
    optimizeCss: true,
    // FCP optimizasyonu - Server components external packages
    serverComponentsExternalPackages: [],
  },
  
  // Output optimization
  output: 'standalone', // Daha küçük build output
  
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Modern JavaScript target - Polyfill'leri azaltmak için
  // Modern tarayıcılar için ES2020+ özelliklerini kullan
  swcMinify: true, // SWC minifier kullan (daha hızlı ve küçük)
  
  // Modern JavaScript features - Polyfill'leri kaldır
  // Next.js 15'te varsayılan olarak modern target kullanılıyor
  // Ancak explicit olarak belirtmek daha iyi
  transpilePackages: [], // Gerekli paketleri buraya ekleyin
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
      {
        // Static assets için cache headers - 10 yıl
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=315360000, immutable',
          },
        ],
      },
      {
        // Images için cache headers - 10 yıl
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=315360000, immutable',
          },
        ],
      },
      {
        // Fonts için cache headers - 10 yıl
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=315360000, immutable',
          },
        ],
      },
      {
        // Ana sayfa için critical font preload - Sadece Regular font (Medium kaldırıldı)
        source: '/',
        headers: [
          {
            key: 'Link',
            value: '</fonts/Inter-Regular.woff2>; rel=preload; as=font; type=font/woff2; crossorigin'
          },
        ],
      },
    ];
  },
  
  // Webpack optimizasyonları
  webpack: (config, { isServer }) => {
    // Production optimizasyonları
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        // Tree shaking - Kullanılmayan kod'u kaldır (81 KiB tasarruf)
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25, // Render-blocking resources'ları azalt
          minSize: 20000, // Küçük chunk'ları birleştir
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk - Büyük kütüphaneleri ayır
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
              minSize: 30000, // Daha büyük chunk'lar oluştur
            },
            // Common chunk - Ortak kod'u birleştir
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
              minSize: 20000,
            },
            // React ve Next.js'i ayrı chunk'a al (render-blocking'i azalt)
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
          },
        },
      };
      
      // Modern JavaScript target - Polyfill'leri kaldır
      // ES2020+ özelliklerini destekleyen tarayıcılar için
      // Bu, Array.prototype.at, Object.fromEntries gibi modern özelliklerin
      // polyfill'lerini kaldırır (11 KiB tasarruf)
      config.target = ['web', 'es2020'];
    }
    return config;
  },
};

export default nextConfig;
