'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Bell, LogOut, Settings, Heart, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from './search-bar'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

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

          {/* Arama Çubuğu - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
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
              <div className="animate-pulse bg-gray-200 h-9 w-20 rounded"></div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {session.user?.name || session.user?.email}
                  </span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <Link
                      href="/profil"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </Link>
                    <Link
                      href="/ilanlarim"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      İlanlarım
                    </Link>
                    <Link
                      href="/favorilerim"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Favorilerim
                    </Link>
                    {session.user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/giris">
                <Button variant="outline" className="border-gray-300 hover:border-blue-600 hover:text-blue-600">
                  <User className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Giriş Yap</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Arama Çubuğu - Mobile */}
        <div className="md:hidden py-4">
          <SearchBar />
        </div>
      </div>
    </header>
  );
} 
