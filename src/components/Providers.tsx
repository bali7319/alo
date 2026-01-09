'use client'

import { SessionProvider } from 'next-auth/react'

// Static export modunda NextAuth çalışmadığı için SessionProvider'ı kaldırıyoruz
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={0} 
      refetchOnWindowFocus={false}
      // NextAuth hatalarını sessizleştirmek için
      basePath={process.env.NEXTAUTH_URL || '/api/auth'}
    >
      {children}
    </SessionProvider>
  )
} 
