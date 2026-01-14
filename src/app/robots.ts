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
          // Eski URL pattern'lerini engelle (404 hatalarını önlemek için)
          '/commodity/',
          '/content.php',
          '/detail.php',
          '/shop/',
          '/ctg/',
          '/shopping/',
          '/products/',
          '/p/',
          // Sayısal URL'leri engelle (eski sistem URL'leri)
          '/*[0-9]*.html',
          '/*[0-9]*.htm',
          '/*[0-9]*.phtml',
          '/*[0-9]*.shtml',
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
          // Eski URL pattern'lerini engelle
          '/commodity/',
          '/content.php',
          '/detail.php',
          '/shop/',
          '/ctg/',
          '/shopping/',
          '/products/',
          '/p/',
          '/*[0-9]*.html',
          '/*[0-9]*.htm',
          '/*[0-9]*.phtml',
          '/*[0-9]*.shtml',
        ],
      },
    ],
    sitemap: 'https://alo17.tr/sitemap.xml',
  }
}

