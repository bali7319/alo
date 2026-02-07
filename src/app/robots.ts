import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // API endpoint'leri - kesinlikle engelle
          '/api/',
          // Geliştirme/test sayfaları
          '/dev/',

          // NOT:
          // Kullanıcı/özel sayfaları robots ile engellemiyoruz.
          // Çünkü robots engeli, Google'ın sayfayı tarayıp `noindex` görmesini engeller ve
          // Search Console'da "Blocked by robots.txt although indexed" uyarısına yol açabilir.
          // Bu sayfalar middleware + layout metadata ile `noindex` olarak işaretlenir.
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dev/',
          // NOT: Özel sayfalar robots ile engellenmez; `noindex` ile kaldırılır.
        ],
      },
    ],
    sitemap: 'https://alo17.tr/sitemap.xml',
  }
}

