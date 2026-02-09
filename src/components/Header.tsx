'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Bell, LogOut, Settings, Heart, MessageCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function Header() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Çıkış sonrası giriş sayfasında (loggedOut/logout) session eski kalabiliyor; burada Profil göstermeyelim
  const isLoginPageAfterLogout =
    pathname === '/giris' &&
    (searchParams.get('loggedOut') === 'true' || searchParams.get('logout') === 'true');
  const effectiveSession = isLoginPageAfterLogout ? null : session;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const previousUnreadCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async (e?: React.MouseEvent) => {
    // 1. Eğer bir form veya link ise default davranışı durdurun
    if (e && e.preventDefault) e.preventDefault();
    
    // 2. Fonksiyonun birden fazla kez tetiklenmesini engellemek için kontrol
    if ((window as any).isLoggingOut) return;
    (window as any).isLoggingOut = true;
    
    setIsSigningOut(true);

    console.log('SignOut başlatılıyor...');

    try {
      // 1) Storage temizleme (güvenlik ve UI tutarlılığı için)
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + window.location.hostname;
      }

      // Storage temizleme
      localStorage.clear();
      sessionStorage.clear();
      console.log('Storage temizlendi');

      // 2) Sunucu tarafında cookie temizleyip redirect eden güvenilir logout
      window.location.href = `/api/logout?next=${encodeURIComponent('/giris?logout=true')}&ts=${Date.now()}`;
      
    } catch (error) {
      console.error('Çıkış hatası:', error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.origin + '/giris?logout=true';
    } finally {
      setIsSigningOut(false);
      (window as any).isLoggingOut = false;
    }
  };

  // Giriş gerektiren butonlar için callback URL oluştur
  const createLoginUrl = (targetPath: string) => {
    const currentPath = pathname;
    return `/giris?callbackUrl=${encodeURIComponent(targetPath)}`;
  };

  // Sesli uyarı çal
  const playNotificationSound = () => {
    try {
      // Web Audio API ile basit bir bip sesi oluştur
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // 800 Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Ses çalma hatası (tarayıcı desteklemiyor olabilir)
      console.log('Sesli uyarı çalınamadı:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!session?.user) return;
    
    // Önceki isteği iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setLoadingNotifications(true);
    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      controller = new AbortController();
      abortControllerRef.current = controller;
      timeoutId = setTimeout(() => {
        if (controller) {
          controller.abort();
        }
      }, 5000); // 5 saniye timeout
      
      const response = await fetch('/api/notifications', {
        credentials: 'include',
        signal: controller.signal,
      });
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // İstek abort edildiyse devam etme
      if (controller.signal.aborted) {
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        const newUnreadCount = data.unreadCount || 0;
        const previousUnreadCount = previousUnreadCountRef.current;
        
        // Yeni bildirim geldiğinde sesli uyarı çal (ilk yüklemede çalma)
        if (!isInitialLoadRef.current && newUnreadCount > previousUnreadCount && previousUnreadCount >= 0) {
          playNotificationSound();
        }
        
        // İlk yükleme tamamlandı
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
        
        setNotifications(data.notifications || []);
        setUnreadCount(newUnreadCount);
        previousUnreadCountRef.current = newUnreadCount;
      } else if (response.status === 502 || response.status === 503) {
        // 502/503 Bad Gateway/Service Unavailable - sunucu hatası, sessizce devam et
        // Bildirimler kritik değil, sadece boş array ile devam et
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error: any) {
      // AbortError'ı tamamen sessizce yok say (normal bir durum - component unmount veya timeout)
      const isAbortError = error?.name === 'AbortError' || 
                           error?.message?.includes('aborted') || 
                           error?.message?.includes('signal is aborted') ||
                           error?.message?.includes('The operation was aborted') ||
                           error?.message?.includes('abort');
      
      if (isAbortError) {
        // AbortError'ı hiç loglama - bu normal bir durum
        return;
      }
      // Diğer hatalar için de sessizce devam et (bildirim yükleme hatası kritik değil)
    } finally {
      // Cleanup
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Sadece abort edilmediyse loading state'i güncelle
      if (controller && !controller.signal.aborted) {
        setLoadingNotifications(false);
      } else if (!controller) {
        setLoadingNotifications(false);
      }
      
      // Sadece mevcut controller'ı temizle
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  // Bildirimleri yükle
  useEffect(() => {
    if (effectiveSession?.user) {
      fetchNotifications();
      // Her 30 saniyede bir bildirimleri kontrol et
      const interval = setInterval(fetchNotifications, 30000);
      return () => {
        clearInterval(interval);
        // Component unmount olduğunda devam eden isteği iptal et
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
      };
    }
  }, [effectiveSession]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Bildirim okundu işaretleme hatası:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Tüm bildirimleri okundu işaretleme hatası:', error);
    }
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo ve Hamburger Menü */}
          <div className="flex items-center space-x-3">
            <Link 
              href="/" 
              className="relative z-50 pointer-events-auto flex items-center space-x-2 hover:opacity-80 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1"
              aria-label="Ana sayfaya git"
            >
              <div className="relative h-10 w-10 flex-shrink-0 transition-transform duration-200 hover:scale-110">
                <Image 
                  src="/images/logo-a17.svg" 
                  alt="Alo17 Logo" 
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-2xl font-bold hidden sm:block">
                <span className="text-blue-600">alo</span>
                <span className="text-blue-600">17</span>
                <span className="text-orange-500">.tr</span>
              </span>
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Bildirimler - Sadece giriş yapılmışsa göster */}
            {effectiveSession && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Bildirimler"
                  >
                    <Bell className="h-5 w-5 text-gray-700" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Bildirimler</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Tümünü okundu işaretle
                      </button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {loadingNotifications ? (
                    <div className="p-4 text-center text-gray-500">Yükleniyor...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Bildiriminiz yok</div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          if (!notification.isRead) {
                            markNotificationAsRead(notification.id);
                          }
                          // Admin bildirimlerinde ilanlar sayfasına yönlendir
                          if (notification.type === 'system' && notification.message.includes('ilan')) {
                            window.location.href = '/admin/ilanlar?status=pending';
                          }
                        }}
                      >
                        <div className="flex-1">
                          <div className={`font-medium ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString('tr-TR')}
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                  {notifications.length > 10 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/notifications" className="cursor-pointer text-center">
                          Tüm bildirimleri gör
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Favorilerim Butonu - Sadece giriş yapılmışsa göster */}
            {effectiveSession && (
              <Button
                asChild
                variant="outline"
                className="hidden sm:flex items-center border-gray-300 hover:border-red-500 hover:text-red-500 transition-all duration-200"
              >
                <Link href="/favorilerim" aria-label="Favorilerim">
                  <Heart className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">Favorilerim</span>
                </Link>
              </Button>
            )}

            {/* Mesajlarım Butonu - Sadece giriş yapılmışsa göster */}
            {effectiveSession && (
              <Button
                asChild
                variant="outline"
                className="hidden sm:flex items-center border-gray-300 hover:border-blue-500 hover:text-blue-500 transition-all duration-200"
              >
                <Link href="/mesajlar" aria-label="Mesajlarım">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">Mesajlarım</span>
                </Link>
              </Button>
            )}

            {/* Kullanıcı Menüsü */}
            {status === 'loading' ? (
              <Button asChild variant="outline" className="border-gray-300 hover:border-blue-600 hover:text-blue-600">
                <Link href={createLoginUrl(pathname || '/')}>
                  <User className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Giriş Yap</span>
                </Link>
              </Button>
            ) : effectiveSession ? (
              /* User dropdown removed (was causing unwanted mobile menu).
                 Keep a simple profile link instead. */
              <Button
                asChild
                variant="outline"
                className="border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
              >
                <Link href="/profil" aria-label="Profil">
                  <User className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Profil</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                className="border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
              >
                <Link href={createLoginUrl(pathname || '/')}>
                  <User className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Giriş Yap</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 
