import type { Metadata } from 'next'
import AdminLayoutClient from './AdminLayoutClient'
import { createMetadata } from '@/lib/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Admin Paneli',
  description: 'Alo17 yönetim paneli.',
  path: '/admin',
  noindex: true,
  nofollow: true,
})

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
