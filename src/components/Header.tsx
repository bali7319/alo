'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Bell, LogOut, Settings, Heart, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from './search-bar'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Static export modunda session yok, varsayılan olarak giriş yapmamış kullanıcı gösteriyoruz
  const session = null;
  const status = 'unauthenticated';

  const handleSignOut = async () => {
    // Static export modunda çıkış işlemi yapılamaz
    console.log('Çıkış yapıldı');
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

            {/* Kullanıcı Menüsü - Static export modunda her zaman giriş yapmamış gösteriyoruz */}
            <Link href="/giris">
              <Button variant="outline" className="border-gray-300 hover:border-blue-600 hover:text-blue-600">
                <User className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Giriş Yap</span>
              </Button>
            </Link>
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
