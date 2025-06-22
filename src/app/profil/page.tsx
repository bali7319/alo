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
  status: 'active' | 'pending' | 'expired';
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('listings');
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/giris');
      return;
    }

    fetchUserListings();
    fetchFavoriteListings();
  }, [session, status, router]);

  const fetchUserListings = async () => {
    try {
      const response = await fetch('/api/listings/user');
      if (response.ok) {
        const data = await response.json();
        setUserListings(data.listings || []);
      }
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteListings = async () => {
    try {
      const response = await fetch('/api/listings/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavoriteListings(data.listings || []);
      }
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
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

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
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

  const user = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string;
    location?: string;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profil Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
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
              <h2 className="text-xl font-semibold text-alo-dark">{user?.name || 'Kullanıcı'}</h2>
              <p className="text-sm text-gray-500">Üyelik: {new Date().getFullYear()}</p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center text-gray-600">
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                <span>{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user?.location && (
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  <span>{user.location}</span>
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
                onClick={handleSignOut}
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
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('listings')}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center ${
                  activeTab === 'listings'
                    ? 'text-alo-orange border-b-2 border-alo-orange'
                    : 'text-gray-500 hover:text-alo-orange'
                }`}
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                İlanlarım
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center ${
                  activeTab === 'favorites'
                    ? 'text-alo-orange border-b-2 border-alo-orange'
                    : 'text-gray-500 hover:text-alo-orange'
                }`}
              >
                <HeartIcon className="w-4 h-4 mr-2" />
                Favorilerim
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center ${
                  activeTab === 'messages'
                    ? 'text-alo-orange border-b-2 border-alo-orange'
                    : 'text-gray-500 hover:text-alo-orange'
                }`}
              >
                <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                Mesajlarım
              </button>
            </nav>
          </div>

          {/* İlanlarım */}
          {activeTab === 'listings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-alo-dark">İlanlarım</h3>
                <Link
                  href="/ilan-ver"
                  className="flex items-center px-4 py-2 bg-alo-orange text-white rounded-lg hover:bg-alo-light-orange"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
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
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-alo-dark mb-2">
                                {listing.title}
                              </h4>
                              <p className="text-xl font-bold text-alo-red mb-2">
                                {listing.price.toLocaleString('tr-TR')} TL
                              </p>
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                {listing.location}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <span className="mr-4">
                                  {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                                <span>{listing.views || 0} görüntülenme</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Link
                                  href={`/ilan/${listing.id}`}
                                  className="text-sm text-alo-orange hover:text-alo-light-orange"
                                >
                                  İlanı Görüntüle
                                </Link>
                                <Link
                                  href={`/ilan/${listing.id}/duzenle`}
                                  className="text-sm text-gray-500 hover:text-alo-orange"
                                >
                                  Düzenle
                                </Link>
                                <button
                                  onClick={() => handleDeleteListing(listing.id)}
                                  className="text-sm text-gray-500 hover:text-alo-red"
                                >
                                  Sil
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
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
                            {listing.isPremium && listing.premiumUntil && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
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
              <h3 className="text-lg font-semibold text-alo-dark mb-6">Favorilerim</h3>
              {favoriteListings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <HeartIcon className="w-16 h-16 mx-auto" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Henüz favori ilanınız yok</h4>
                  <p className="text-gray-500 mb-4">Beğendiğiniz ilanları favorilere ekleyin!</p>
                  <Link
                    href="/ilanlar"
                    className="inline-flex items-center px-4 py-2 bg-alo-orange text-white rounded-lg hover:bg-alo-light-orange"
                  >
                    İlanları Keşfedin
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {favoriteListings.map((listing) => (
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
                        </div>
                        <div className="flex-1 p-4">
                          <h4 className="font-semibold text-alo-dark mb-2">
                            {listing.title}
                          </h4>
                          <p className="text-xl font-bold text-alo-red mb-2">
                            {listing.price.toLocaleString('tr-TR')} TL
                          </p>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {listing.location}
                          </div>
                          <Link
                            href={`/ilan/${listing.id}`}
                            className="text-sm text-alo-orange hover:text-alo-light-orange"
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
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <ChatBubbleLeftIcon className="w-16 h-16 mx-auto" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Henüz mesajınız yok</h4>
              <p className="text-gray-500">İlan sahipleriyle iletişime geçmek için mesaj gönderin!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
