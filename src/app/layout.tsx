import { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Providers from '@/components/Providers'
import Header from '@/components/Header'
import Footer from '@/components/footer'
import CookieConsent from '@/components/CookieConsent'

// Font optimization - Sadece Regular font yükle (220 KB → ~110 KB tasarruf)
// Bold font'u CSS font-weight ile simüle et (font-weight: 700)
// Bu, font dosyası sayısını 2'den 1'e düşürür ve ~110 KB daha tasarruf sağlar
const inter = localFont({
  src: [
    {
      path: '../fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    // Bold font kaldırıldı - CSS font-weight: 700 ile simüle edilebilir
    // Bu ~110 KB daha tasarruf sağlar (220 KB → ~110 KB)
  ],
  variable: '--font-inter',
  display: 'swap', // Font yüklenene kadar fallback göster - FCP için kritik
  preload: true, // Critical font'u preload et
  fallback: ['system-ui', 'arial'], // Fallback font'lar
  adjustFontFallback: true, // Font fallback'i optimize et
})

export const metadata: Metadata = {
  metadataBase: new URL('https://alo17.tr'),
  applicationName: 'Alo17',
  category: 'Marketplace',
  title: {
    default: 'Alo17 - Çanakkalenin En Büyük İlan Sitesi',
    template: '%s | Alo17'
  },
  description: 'Çanakkalede ücretsiz ilan ver, ikinci el eşya al-sat, iş ilanları bul. Elektronik, giyim, ev eşyaları, araba ve daha fazlası için güvenilir platform.',
  keywords: [
    'alo17',
    'çanakkale ilan',
    'ikinci el',
    'satılık',
    'kiralık',
    'iş ilanları',
    'elektronik',
    'giyim',
    'ev eşyaları',
    'araç',
    'emlak',
    'çanakkale',
    'ücretsiz ilan',
    'ilan sitesi'
  ],
  authors: [{ name: 'Alo17' }],
  creator: 'Alo17',
  publisher: 'Alo17',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://alo17.tr',
    siteName: 'Alo17',
    title: 'Alo17 - Çanakkalenin En Büyük İlan Sitesi',
    description: 'Çanakkalede ücretsiz ilan ver, ikinci el eşya al-sat, iş ilanları bul. Elektronik, giyim, ev eşyaları ve daha fazlası.',
    images: [
      {
        url: '/images/placeholder.jpg',
        width: 1200,
        height: 630,
        alt: 'Alo17 - İlan Sitesi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alo17 - Çanakkalenin En Büyük İlan Sitesi',
    description: 'Çanakkale\'de ücretsiz ilan ver, ikinci el eşya al-sat, iş ilanları bul.',
    images: ['/images/placeholder.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Google Search Console verification code buraya eklenecek
    // google: 'your-google-verification-code',
    other: {
      'facebook-domain-verification': 'n7wll8y665640cgxarhhaluwpuq6lt',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-icon.svg',
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`h-full ${inter.variable}`}>
      <body className={`h-full font-sans antialiased ${inter.className}`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  )
}
