import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profil/',
          '/ilanlarim/',
          '/favorilerim/',
          '/mesajlar/',
          '/odeme/',
          '/giris',
          '/kayit',
          '/register',
          '/login',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profil/',
          '/ilanlarim/',
          '/favorilerim/',
          '/mesajlar/',
          '/odeme/',
        ],
      },
    ],
    sitemap: 'https://alo17.tr/sitemap.xml',
  }
}

