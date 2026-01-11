import { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Providers from '@/components/Providers'
import Header from '@/components/Header'
import Footer from '@/components/footer'

// Font optimization - Tüm font dosyalarını tek bir istekte yükle
const inter = localFont({
  src: [
    {
      path: '../fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Inter-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Inter-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/Inter-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap', // Font yüklenene kadar fallback göster
  preload: true, // Critical font'u preload et
  fallback: ['system-ui', 'arial'], // Fallback font'lar
})

export const metadata: Metadata = {
  metadataBase: new URL('https://alo17.tr'),
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
        url: '/images/og-image.jpg',
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
    images: ['/images/og-image.jpg'],
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
  },
  alternates: {
    canonical: 'https://alo17.tr',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-icon.svg',
  },
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
      <head>
        {/* Resource hints - DNS prefetch ve preconnect */}
        <link rel="dns-prefetch" href="https://alo17.tr" />
        <link rel="preconnect" href="https://alo17.tr" crossOrigin="anonymous" />
        {/* Critical resources preload */}
        <link rel="preload" href="/favicon.svg" as="image" type="image/svg+xml" />
      </head>
      <body className={`h-full font-sans antialiased ${inter.className}`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
