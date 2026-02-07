import type { Metadata } from 'next'
import { createMetadata } from '@/lib/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Şifremi Unuttum',
  description: 'Şifre sıfırlama bağlantısı almak için e-posta adresinizi girin.',
  path: '/sifremi-unuttum',
  noindex: true,
  nofollow: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

