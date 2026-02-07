import type { Metadata } from 'next'
import { createMetadata } from '@/lib/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Favorilerim',
  description: 'Alo17 favori ilanlarınız.',
  path: '/favorilerim',
  noindex: true,
  nofollow: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

