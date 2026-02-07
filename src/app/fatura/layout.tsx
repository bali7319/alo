import type { Metadata } from 'next'
import { createMetadata } from '@/lib/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Fatura',
  description: 'Fatura görüntüleme.',
  path: '/fatura',
  noindex: true,
  nofollow: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

