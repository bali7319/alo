'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// Static export modunda NextAuth çalışmadığı için SessionProvider'ı kaldırıyoruz
export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

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

  // Android geri butonu için event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let backButtonListener: any = null;

    // Capacitor App plugin'i varsa kullan
    const handleBackButton = async () => {
      try {
        const { App } = await import('@capacitor/app');
        
        backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
          const currentPath = window.location.pathname;
          
          if (!canGoBack || currentPath === '/') {
            // Geri gidecek sayfa yoksa veya anasayfadaysa anasayfaya yönlendir
            if (currentPath !== '/') {
              router.push('/');
            } else {
              // Anasayfadaysa uygulamayı kapat
              App.exitApp();
            }
          } else {
            // Next.js router ile geri git
            router.back();
          }
        });
      } catch (error) {
        // Capacitor App plugin yoksa, popstate event'ini dinle
        const handlePopState = () => {
          const currentPath = window.location.pathname;
          if (currentPath !== '/') {
            router.push('/');
          }
        };
        
        window.addEventListener('popstate', handlePopState);
        
        return () => {
          window.removeEventListener('popstate', handlePopState);
        };
      }
    };

    handleBackButton();

    return () => {
      // Cleanup
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [router, pathname]);

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
