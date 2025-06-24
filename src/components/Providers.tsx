'use client'

import { SessionProvider } from 'next-auth/react'

// Static export modunda NextAuth çalışmadığı için SessionProvider'ı kaldırıyoruz
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
} 
