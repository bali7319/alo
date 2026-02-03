import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Alo17',
    short_name: 'Alo17',
    description:
      'Çanakkale’de ücretsiz ilan ver, ikinci el eşya al-sat, iş ilanları bul. Güvenilir ilan platformu.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: 'tr',
    icons: [
      // SVG icons are supported by modern browsers; you can add PNGs later if needed.
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
    ],
  }
}

