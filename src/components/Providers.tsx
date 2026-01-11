'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

// Static export modunda NextAuth çalışmadığı için SessionProvider'ı kaldırıyoruz
export default function Providers({ children }: { children: React.ReactNode }) {
  // Long tasks'ları optimize et - FCP için kritik
  useEffect(() => {
    // Code splitting ile yüklenen modüller için
    // Main thread'i bloklamamak için
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      // Idle callback kullan - main thread'i bloklamaz
      const idleCallback = (window as any).requestIdleCallback || ((fn: () => void) => setTimeout(fn, 1));
      idleCallback(() => {
        // Non-critical işlemler burada yapılabilir
      });
    }
  }, []);

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
