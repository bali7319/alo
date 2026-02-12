import type { Metadata } from 'next'
import { createMetadata } from '@/lib/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Bildirim Aboneliğini İptal Et',
  description: 'E-posta bildirim aboneliğinizi iptal edin.',
  path: '/unsubscribe',
  noindex: true,
  nofollow: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
