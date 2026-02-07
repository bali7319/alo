import type { Metadata } from 'next'
import { createMetadata } from '@/lib/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Mesajlar',
  description: 'Alo17 mesajlarınız.',
  path: '/mesajlar',
  noindex: true,
  nofollow: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

