'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { createListingSlug } from '@/lib/slug';

interface FavoriteListing {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  subCategory?: string;
  description: string;
  images: string;
  createdAt: string;
  condition?: string;
  isPremium: boolean;
  premiumUntil?: string;
  expiresAt: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
}

export default function FavorilerimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      const currentPath = window.location.pathname;
      router.push(`/giris?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    fetchFavorites();
  }, [session, status, router]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/listings/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.listings || []);
      }
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/favorites/${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.id !== listingId));
      } else {
        alert('Favorilerden çıkarılırken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Favori silme hatası:', error);
      alert('Favorilerden çıkarılırken bir hata oluştu.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorilerim</h1>
        <p className="text-gray-600">
          Beğendiğiniz ilanları burada takip edebilirsiniz.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz favori ilanınız yok</h3>
          <p className="mt-1 text-sm text-gray-500">
            Beğendiğiniz ilanları favorilere ekleyerek burada takip edebilirsiniz.
          </p>
          <div className="mt-6">
            <Link
              href="/ilanlar"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              İlanları Keşfet
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((listing) => {
            // Güvenli JSON parse
            const safeParseImages = (images: string | null): string[] => {
              if (!images) return [];
              try {
                if (typeof images === 'string') {
                  if (images.startsWith('data:image')) {
                    return [images];
                  }
                  const parsed = JSON.parse(images);
                  return Array.isArray(parsed) ? parsed : [];
                }
                return Array.isArray(images) ? images : [];
              } catch {
                return [];
              }
            };
            const images = safeParseImages(listing.images);
            const mainImage = images[0] || '/images/placeholder.svg';
            
            return (
              <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={mainImage}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                  {listing.isPremium && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Premium
                    </div>
                  )}
                  <button
                    onClick={() => removeFromFavorites(listing.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-blue-600">
                      ₺{listing.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{listing.location}</span>
                    <span className="mx-2">•</span>
                    <span>{listing.category}</span>
                    {listing.subCategory && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{listing.subCategory}</span>
                      </>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {listing.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/ilan/${createListingSlug(listing.title, listing.id)}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Görüntüle
                    </Link>
                    
                    <span className="text-xs text-gray-400">
                      {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 
