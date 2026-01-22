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
          // Kullanıcı özel sayfaları - engelle
          '/admin/',
          '/moderator/',
          '/profil/',
          '/ilanlarim/',
          '/favorilerim/',
          '/mesajlar/',
          '/odeme/',
          '/fatura/',
          '/sifre-sifirla/',
          '/sifremi-unuttum/',
          // Not: Eski/spam URL pattern'lerini robots ile engellemiyoruz.
          // Çünkü Google "Blocked by robots.txt" olarak raporlar ve index'ten çıkarması gecikebilir.
          // Bu URL'ler middleware'de 410 Gone dönüyor; botların görmesi daha iyi.
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/moderator/',
          '/profil/',
          '/ilanlarim/',
          '/favorilerim/',
          '/mesajlar/',
          '/odeme/',
          '/fatura/',
          '/sifre-sifirla/',
          '/sifremi-unuttum/',
          // Not: Eski/spam URL pattern'leri 410 Gone ile kaldırılıyor (middleware).
        ],
      },
    ],
    sitemap: 'https://alo17.tr/sitemap.xml',
  }
}

