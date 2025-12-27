'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Edit, Trash, Plus, EyeOff, CheckCircle, XCircle, Clock } from 'lucide-react';
import { createSlug } from '@/lib/slug';

interface MyListing {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  subCategory?: string;
  description: string;
  images: string;
  createdAt: string;
  isActive: boolean;
  isPremium: boolean;
  approvalStatus: string;
  views: number;
  expiresAt: string;
}

export default function IlanlarimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      const currentPath = window.location.pathname;
      router.push(`/giris?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    fetchMyListings();
  }, [session, status, router]);

  const fetchMyListings = async () => {
    try {
      const response = await fetch('/api/listings/my-listings');
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error('İlanlarım yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setListings(prev => prev.filter(listing => listing.id !== listingId));
      } else {
        alert('İlan silinirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('İlan silme hatası:', error);
      alert('İlan silinirken bir hata oluştu.');
    }
  };

  const toggleListingStatus = async (listingId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setListings(prev => 
          prev.map(listing => 
            listing.id === listingId 
              ? { ...listing, isActive: !currentStatus }
              : listing
          )
        );
      } else {
        alert('İlan durumu güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('İlan durumu güncelleme hatası:', error);
      alert('İlan durumu güncellenirken bir hata oluştu.');
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Onay Bekliyor
        </span>
      );
    } else if (status === 'rejected') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Reddedildi
        </span>
      );
    } else if (status === 'approved' && isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aktif
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <EyeOff className="w-3 h-3 mr-1" />
          Pasif
        </span>
      );
    }
  };

  if (status === 'loading' || loading) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">İlanlarım</h1>
            <p className="text-gray-600">
              Yayınladığınız ilanları buradan yönetebilirsiniz.
            </p>
          </div>
          <Link
            href="/ilan-ver"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni İlan Ver
          </Link>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz ilanınız yok</h3>
          <p className="text-gray-500 mb-6">
            İlk ilanınızı yayınlayarak satışa başlayın.
          </p>
          <Link
            href="/ilan-ver"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            İlk İlanınızı Verin
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => {
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
            const mainImage = images[0] || '/images/placeholder.jpg';
            
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
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(listing.approvalStatus, listing.isActive)}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-blue-600">
                      ₺{listing.price.toLocaleString()}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="w-4 h-4 mr-1" />
                      {listing.views}
                    </div>
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
                    <div className="flex space-x-2">
                      <Link
                        href={`/ilan/${createSlug(listing.title)}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Görüntüle
                      </Link>
                      
                      <Link
                        href={`/ilan-ver/duzenle/${listing.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Düzenle
                      </Link>
                    </div>
                    
                    <button
                      onClick={() => deleteListing(listing.id)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      Sil
                    </button>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>
                        Oluşturulma: {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                      <span>
                        Bitiş: {new Date(listing.expiresAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
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
