import type { Metadata } from 'next'
import { createMetadata } from '@/lib/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Ödeme',
  description: 'Ödeme adımı.',
  path: '/odeme',
  noindex: true,
  nofollow: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

