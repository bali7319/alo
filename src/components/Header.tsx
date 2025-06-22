'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User, Bell, LogOut, Settings, Heart, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-bold">
                <span className="text-blue-600">alo</span>
                <span className="text-blue-600">17</span>
                <span className="text-orange-500">.tr</span>
              </span>
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Bildirimler Butonu - Sadece giriş yapmış kullanıcılar için */}
            {session && (
              <Link href="/notifications">
                <Button variant="outline" className="hidden md:flex border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  <Bell className="h-4 w-4 mr-2" />
                  Bildirimler
                </Button>
              </Link>
            )}

            {/* İlan Ver Butonu */}
            <Link href="/ilan-ver">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium">
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">İlan Ver</span>
                <span className="sm:hidden">+</span>
              </Button>
            </Link>

            {/* Kullanıcı Menüsü */}
            {status === 'loading' ? (
              // Yükleniyor durumu
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
            ) : session ? (
              // Giriş yapmış kullanıcı - Profil menüsü
              <div className="relative">
                <Button
                  variant="outline"
                  className="border-gray-300 flex items-center space-x-2"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden lg:inline text-sm">
                    {session.user?.name || session.user?.email?.split('@')[0]}
                  </span>
                </Button>

                {/* Profil Dropdown Menüsü */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <Link href="/profil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profilim
                      </div>
                    </Link>
                    <Link href="/favorilerim" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-2" />
                        Favorilerim
                      </div>
                    </Link>
                    <Link href="/ilanlarim" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <div className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        İlanlarım
                      </div>
                    </Link>
                    <Link href="/ayarlar" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Ayarlar
                      </div>
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Çıkış Yap
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Giriş yapmamış kullanıcı - Giriş butonu
              <Link href="/giris">
                <Button variant="outline" className="border-gray-300 hover:border-blue-600 hover:text-blue-600">
                  <User className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Giriş Yap</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown menüsü dışına tıklandığında kapatma */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </header>
  );
} 
