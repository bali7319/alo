'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Bell, LogOut, Settings, Heart, MessageCircle, Menu, X } from "lucide-react"
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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Giriş gerektiren butonlar için callback URL oluştur
  const createLoginUrl = (targetPath: string) => {
    const currentPath = pathname;
    return `/giris?callbackUrl=${encodeURIComponent(targetPath)}`;
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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
                  {(session.user as any)?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
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
    </header>
  )
}

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
      </div>
    </header>
  );
} 
