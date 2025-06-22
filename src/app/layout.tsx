import { Metadata } from 'next'
// import localFont from 'next/font/local'
import './globals.css'
import Providers from '@/components/Providers'
import Header from '@/components/Header'
import Footer from '@/components/footer'

// const inter = localFont({
//   src: [
//     {
//       path: '../fonts/Inter-Regular.woff2',
//       weight: '400',
//       style: 'normal',
//     },
//     {
//       path: '../fonts/Inter-Medium.woff2',
//       weight: '500',
//       style: 'normal',
//     },
//     {
//       path: '../fonts/Inter-SemiBold.woff2',
//       weight: '600',
//       style: 'normal',
//     },
//     {
//       path: '../fonts/Inter-Bold.woff2',
//       weight: '700',
//       style: 'normal',
//     },
//   ],
//   variable: '--font-inter',
// })

export const metadata: Metadata = {
  title: 'Alo17 - Ev Hizmetleri ve Daha Fazlası',
  description: 'Ev hizmetleri, eğitim, sağlık ve daha fazlası için güvenilir platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="font-sans">
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
