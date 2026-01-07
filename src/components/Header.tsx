'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Bell, LogOut, Settings, Heart, MessageCircle, Menu, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const previousUnreadCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
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
    
    setLoadingNotifications(true);
    try {
      const response = await fetch('/api/notifications');
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
      }
    } catch (error) {
      console.error('Bildirim yükleme hatası:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Bildirimleri yükle
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      // Her 30 saniyede bir bildirimleri kontrol et
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

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
            {/* Hamburger Menü Butonu - Mobil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 transition-transform duration-200" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 transition-transform duration-200" />
              )}
            </button>
            
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1"
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
            {session && (
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
            {session && (
              <Link href="/favorilerim" aria-label="Favorilerim">
                <Button variant="outline" className="hidden sm:flex items-center border-gray-300 hover:border-red-500 hover:text-red-500 transition-all duration-200">
                  <Heart className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">Favorilerim</span>
                </Button>
              </Link>
            )}

            {/* Mesajlarım Butonu - Sadece giriş yapılmışsa göster */}
            {session && (
              <Link href="/mesajlar" aria-label="Mesajlarım">
                <Button variant="outline" className="hidden sm:flex items-center border-gray-300 hover:border-blue-500 hover:text-blue-500 transition-all duration-200">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">Mesajlarım</span>
                </Button>
              </Link>
            )}

            {/* Kullanıcı Menüsü */}
            {status === 'loading' ? (
              <Link href={createLoginUrl(pathname || '/')}>
                <Button variant="outline" className="border-gray-300 hover:border-blue-600 hover:text-blue-600">
                  <User className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Giriş Yap</span>
                </Button>
              </Link>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Kullanıcı menüsü"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110">
                      <span className="text-white font-medium text-sm">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700">
                      {session.user?.name || session.user?.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    {session.user?.name || session.user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profil" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/ilanlarim" className="cursor-pointer">
                      <Heart className="h-4 w-4 mr-2" />
                      İlanlarım
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorilerim" className="cursor-pointer">
                      <Heart className="h-4 w-4 mr-2" />
                      Favorilerim
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mesajlar" className="cursor-pointer">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Mesajlarım
                    </Link>
                  </DropdownMenuItem>
                  {((session.user as any)?.role === 'admin' || (session.user as any)?.role === 'moderator') && (
                    <>
                      <DropdownMenuSeparator />
                      {(session.user as any)?.role === 'moderator' && (
                        <DropdownMenuItem asChild>
                          <Link href="/moderator" className="cursor-pointer">
                            <Shield className="h-4 w-4 mr-2" />
                            Moderatör Paneli
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {(session.user as any)?.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href={createLoginUrl(pathname || '/')}>
                <Button variant="outline" className="border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-200">
                  <User className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Giriş Yap</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobil Menü */}
      {isMenuOpen && (
        <>
          {/* Overlay - Menüyü kapatmak için */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="md:hidden border-t bg-white relative z-50">
            <div className="px-4 py-4 space-y-2">
              {/* Giriş yapılmışsa menü öğeleri */}
              {session ? (
                <>
                  <Link
                    href="/favorilerim"
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5 mr-3 text-red-500" />
                    <span className="font-medium">Favorilerim</span>
                  </Link>
                  <Link
                    href="/mesajlar"
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageCircle className="h-5 w-5 mr-3 text-blue-500" />
                    <span className="font-medium">Mesajlarım</span>
                  </Link>
                  <Link
                    href="/ilanlarim"
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5 mr-3 text-orange-500" />
                    <span className="font-medium">İlanlarım</span>
                  </Link>
                  <Link
                    href="/profil"
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3 text-gray-500" />
                    <span className="font-medium">Profil</span>
                  </Link>
                  {((session.user as any)?.role === 'admin' || (session.user as any)?.role === 'moderator') && (
                    <>
                      {(session.user as any)?.role === 'moderator' && (
                        <Link
                          href="/moderator"
                          className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Shield className="h-5 w-5 mr-3 text-purple-500" />
                          <span className="font-medium">Moderatör Paneli</span>
                        </Link>
                      )}
                      {(session.user as any)?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="h-5 w-5 mr-3 text-purple-500" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-red-600"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span className="font-medium">Çıkış Yap</span>
                  </button>
                </>
              ) : (
                <Link
                  href={createLoginUrl(pathname || '/')}
                  className="flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  Giriş Yap
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
} 
