'use client';

import { useState, useEffect } from 'react';
import { ListingCard } from '@/components/listing-card';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  subCategory: string | null;
  description: string;
  images: string[];
  createdAt: string;
  isPremium: boolean;
  views: number;
  user: {
    id: string;
    name: string;
  };
}

export default function IlanlarPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchListings();
  }, [page]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/listings?page=${page}&limit=20`);
      const data = await response.json();
      
      if (response.ok) {
        setListings(data.listings || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        setError(data.error || 'İlanlar yüklenirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('İlanlar yükleme hatası:', error);
      setError('İlanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">Tüm İlanlar</h1>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <SearchBar />
        </div>
      </section>

      {/* İlanlar */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {listings.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Henüz ilan bulunmuyor.</p>
            <Button asChild>
              <a href="/ilan-ver">İlan Ver</a>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing as any} />
              ))}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Önceki
                </Button>
                <span className="px-4 py-2 flex items-center">
                  Sayfa {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

