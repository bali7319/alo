'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { listingTypes, listingStatus, Listing } from '@/types/listings';
import { createSlug } from '@/lib/slug';

interface UserListing {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  subCategory: string;
  description: string;
  images: string[];
  createdAt: string;
  condition: string | null;
  isPremium: boolean;
  premiumUntil: string | null;
  expiresAt: string;
  views: number;
  isActive: boolean;
  status: 'active' | 'pending' | 'expired';
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('listings');
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      const currentPath = window.location.pathname;
      router.push(`/giris?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    fetchUserProfile();
    fetchUserListings();
    fetchFavoriteListings();
  }, [session, status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        cache: 'no-store', // Her zaman güncel bilgileri çek
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      } else {
        console.error('Profil bilgileri yüklenirken hata:', response.status, response.statusText);
        // Hata durumunda session'dan bilgileri kullan
      }
    } catch (error) {
      console.error('Profil bilgileri yüklenirken hata:', error);
      // Hata durumunda session'dan bilgileri kullan
    }
  };

  const fetchUserListings = async () => {
    try {
      const response = await fetch('/api/listings/user', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserListings(data.listings || []);
      } else {
        console.error('İlanlar yüklenirken hata:', response.status, response.statusText);
        setUserListings([]); // Boş liste göster
      }
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
      setUserListings([]); // Hata durumunda boş liste göster
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteListings = async () => {
    try {
      const response = await fetch('/api/listings/favorites', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFavoriteListings(data.listings || []);
      } else {
        console.error('Favoriler yüklenirken hata:', response.status, response.statusText);
        setFavoriteListings([]); // Boş liste göster
      }
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
      setFavoriteListings([]); // Hata durumunda boş liste göster
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUserListings(prev => prev.filter(listing => listing.id !== id));
      } else {
        alert('İlan silinirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('İlan silme hatası:', error);
      alert('İlan silinirken bir hata oluştu.');
    }
  };

  const handleSignOut = async () => {
    try {
      // Önce NextAuth signout endpoint'ini çağır (cookie'yi silmek için)
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Cookie'leri manuel olarak sil (güvenlik için)
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        // NextAuth cookie'lerini sil
        if (name.includes('next-auth') || name.includes('session')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.alo17.tr`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=alo17.tr`;
        }
      }
      
      // NextAuth signOut'u çağır (session'ı temizlemek için)
      await signOut({ 
        callbackUrl: '/',
        redirect: false 
      });
      
      // Kısa bir bekleme ekle (cookie silme işleminin tamamlanması için)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Ana sayfaya yönlendir
      window.location.href = '/';
    } catch (error) {
      console.error('SignOut hatası:', error);
      // Hata durumunda bile cookie'leri sil ve yönlendir
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.includes('next-auth') || name.includes('session')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.alo17.tr`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=alo17.tr`;
        }
      }
      // Ana sayfaya yönlendir
      window.location.href = '/';
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alo-orange"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Router zaten giriş sayfasına yönlendirecek
  }

  // API'den güncel bilgiler varsa onları kullan, yoksa session'dan al
  const user = userProfile || (session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string;
    location?: string;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
        {/* Profil Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-3 sm:mb-4">
                <Image
                  src={user?.image || '/images/placeholder.jpg'}
                  alt={user?.name || 'Kullanıcı'}
                  fill
                  className="rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-alo-orange text-white rounded-full hover:bg-alo-light-orange">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-alo-dark text-center">{user?.name || 'Kullanıcı'}</h2>
              <p className="text-xs sm:text-sm text-gray-500">Üyelik: {new Date().getFullYear()}</p>
            </div>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div className="flex items-center text-gray-600 text-sm sm:text-base">
                <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center text-gray-600 text-sm sm:text-base">
                  <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="truncate">{user.phone}</span>
                </div>
              )}
              {user?.location && (
                <div className="flex items-center text-gray-600 text-sm sm:text-base">
                  <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="truncate">{user.location}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <Link
                href="/profil/duzenle"
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-alo-orange hover:text-alo-light-orange"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Profili Düzenle
              </Link>
              <button
                onClick={(e) => handleSignOut(e)}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="lg:col-span-3">
          {/* Sekmeler */}
          <div className="bg-white rounded-xl shadow-sm mb-4 md:mb-6">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('listings')}
                className={`flex-1 min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center justify-center whitespace-nowrap ${
                  activeTab === 'listings'
                    ? 'text-alo-orange border-b-2 border-alo-orange'
                    : 'text-gray-500 hover:text-alo-orange'
                }`}
              >
                <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">İlanlarım</span>
                <span className="sm:hidden">İlanlar</span>
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center justify-center whitespace-nowrap ${
                  activeTab === 'favorites'
                    ? 'text-alo-orange border-b-2 border-alo-orange'
                    : 'text-gray-500 hover:text-alo-orange'
                }`}
              >
                <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Favorilerim</span>
                <span className="sm:hidden">Favoriler</span>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center justify-center whitespace-nowrap ${
                  activeTab === 'messages'
                    ? 'text-alo-orange border-b-2 border-alo-orange'
                    : 'text-gray-500 hover:text-alo-orange'
                }`}
              >
                <ChatBubbleLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Mesajlarım</span>
                <span className="sm:hidden">Mesajlar</span>
              </button>
            </nav>
          </div>

          {/* İlanlarım */}
          {activeTab === 'listings' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-alo-dark">İlanlarım</h3>
                <Link
                  href="/ilan-ver"
                  className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-alo-orange text-white text-sm sm:text-base rounded-lg hover:bg-alo-light-orange whitespace-nowrap"
                >
                  <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Yeni İlan
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-alo-orange"></div>
                </div>
              ) : userListings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <EyeIcon className="w-16 h-16 mx-auto" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Henüz ilanınız yok</h4>
                  <p className="text-gray-500 mb-4">İlk ilanınızı yayınlayarak başlayın!</p>
                  <Link
                    href="/ilan-ver"
                    className="inline-flex items-center px-4 py-2 bg-alo-orange text-white rounded-lg hover:bg-alo-light-orange"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    İlk İlanınızı Verin
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-48 h-48">
                          <Image
                            src={listing.images[0] || '/images/placeholder.jpg'}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                          {listing.isPremium && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                              Premium
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-3 sm:p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base text-alo-dark mb-1 sm:mb-2 line-clamp-2">
                                {listing.title}
                              </h4>
                              <p className="text-lg sm:text-xl font-bold text-alo-red mb-1 sm:mb-2">
                                {listing.price.toLocaleString('tr-TR')} TL
                              </p>
                              <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                                <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{listing.location}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm text-gray-500 mb-2">
                                <span>
                                  {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                                <span className="hidden sm:inline mr-4">•</span>
                                <span>{listing.views || 0} görüntülenme</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {listing.status === 'expired' && listing.isActive === false ? (
                                  <button
                                    onClick={async () => {
                                      if (!confirm('Bu ilanı tekrar yayınlamak istediğinizden emin misiniz? İlan moderatör onayına gönderilecektir.')) return;
                                      
                                      try {
                                        const response = await fetch(`/api/listings/${listing.id}/renew`, {
                                          method: 'POST',
                                        });
                                        
                                        if (response.ok) {
                                          alert('İlan tekrar yayınlandı ve moderatör onayına gönderildi.');
                                          fetchUserListings();
                                        } else {
                                          const data = await response.json();
                                          alert(data.error || 'İlan yenilenirken bir hata oluştu.');
                                        }
                                      } catch (error) {
                                        console.error('İlan yenileme hatası:', error);
                                        alert('İlan yenilenirken bir hata oluştu.');
                                      }
                                    }}
                                    className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 whitespace-nowrap"
                                  >
                                    Tekrar Yayınla
                                  </button>
                                ) : (
                                  <Link
                                    href={`/ilan/${createSlug(listing.title)}`}
                                    className="text-xs sm:text-sm text-alo-orange hover:text-alo-light-orange whitespace-nowrap"
                                  >
                                    İlanı Görüntüle
                                  </Link>
                                )}
                                <Link
                                  href={`/ilan-ver/duzenle/${listing.id}`}
                                  className="text-xs sm:text-sm text-gray-500 hover:text-alo-orange whitespace-nowrap"
                                >
                                  Düzenle
                                </Link>
                                <button
                                  onClick={() => handleDeleteListing(listing.id)}
                                  className="text-xs sm:text-sm text-gray-500 hover:text-alo-red whitespace-nowrap"
                                >
                                  Sil
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                listing.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : listing.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {listing.status === 'active' ? 'Aktif' : 
                               listing.status === 'pending' ? 'Onay Bekliyor' : 'Süresi Dolmuş'}
                            </span>
                            {listing.status === 'expired' && listing.isActive === false && (
                              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {(() => {
                                  const expiresAt = new Date(listing.expiresAt);
                                  const now = new Date();
                                  const daysSinceExpiry = Math.floor((now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60 * 24));
                                  const daysLeft = 7 - daysSinceExpiry;
                                  return daysLeft > 0 ? `${daysLeft} gün içinde tekrar yayınlanabilir` : 'Tekrar yayınlanamaz';
                                })()}
                              </span>
                            )}
                            {listing.isPremium && listing.premiumUntil && (
                              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Premium: {new Date(listing.premiumUntil).toLocaleDateString('tr-TR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorilerim */}
          {activeTab === 'favorites' && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-alo-dark mb-4 md:mb-6">Favorilerim</h3>
              {favoriteListings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <HeartIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                  </div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Henüz favori ilanınız yok</h4>
                  <p className="text-sm sm:text-base text-gray-500 mb-4">Beğendiğiniz ilanları favorilere ekleyin!</p>
                  <Link
                    href="/ilanlar"
                    className="inline-flex items-center px-3 sm:px-4 py-2 bg-alo-orange text-white text-sm sm:text-base rounded-lg hover:bg-alo-light-orange"
                  >
                    İlanları Keşfedin
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {favoriteListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-48 h-48">
                          <Image
                            src={listing.images[0] || '/images/placeholder.jpg'}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 p-3 sm:p-4">
                          <h4 className="font-semibold text-sm sm:text-base text-alo-dark mb-1 sm:mb-2 line-clamp-2">
                            {listing.title}
                          </h4>
                          <p className="text-lg sm:text-xl font-bold text-alo-red mb-1 sm:mb-2">
                            {listing.price.toLocaleString('tr-TR')} TL
                          </p>
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2">
                            <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{listing.location}</span>
                          </div>
                          <Link
                            href={`/ilan/${createSlug(listing.title)}`}
                            className="text-xs sm:text-sm text-alo-orange hover:text-alo-light-orange inline-block"
                          >
                            İlanı Görüntüle
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mesajlarım */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
              <div className="text-gray-400 mb-4">
                <ChatBubbleLeftIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
              </div>
              <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Henüz mesajınız yok</h4>
              <p className="text-sm sm:text-base text-gray-500">İlan sahipleriyle iletişime geçmek için mesaj gönderin!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
