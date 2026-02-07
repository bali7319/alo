import type { Metadata } from 'next'
import { createMetadata } from '@/lib/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Giriş Yap',
  description: 'Alo17 hesabınıza giriş yapın.',
  path: '/giris',
  noindex: true,
  nofollow: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

