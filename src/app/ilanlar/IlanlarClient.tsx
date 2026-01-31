'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  views?: number;
  user: {
    id: string;
    name: string;
  };
}

function IlanlarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageFromUrl = (() => {
    const raw = searchParams.get('page') || '';
    const n = raw && /^\d+$/.test(raw) ? parseInt(raw, 10) : 1;
    return Number.isFinite(n) ? Math.max(1, n) : 1;
  })();
  const [page, setPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);

  // URL'deki search parametresini al
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    // Search parametresi değiştiğinde sayfayı 1'e sıfırla
    if (searchQuery) {
      setPage(1);
    }
  }, [searchQuery]);

  // URL değiştiğinde state'i senkron tut (back/forward)
  useEffect(() => {
    if (pageFromUrl !== page) setPage(pageFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageFromUrl]);

  // Page değişince URL'yi güncelle (shareable pagination)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete('page');
    else params.set('page', String(page));
    // keep `search` if present
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Search parametresini API'ye gönder
        const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
        const apiUrl = `/api/listings?page=${page}&limit=20${searchParam}`;

        // Allow HTTP caching (controlled by API Cache-Control).
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`API hatası: ${response.status}`);
        }

        const data = await response.json();

        if (data.listings && Array.isArray(data.listings)) {
          setListings(data.listings);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          setListings([]);
          setTotalPages(1);
        }
      } catch (error: any) {
        setError(error.message || 'İlanlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        setListings([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [page, searchQuery]);

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
          <div className="mt-4 flex justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold shadow-lg"
            >
              <a href="/ilan-ver">İlan Ver</a>
            </Button>
          </div>
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
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        {listings.length === 0 && !loading && !error ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Henüz ilan bulunmuyor.</p>
            <Button asChild>
              <a href="/ilan-ver">İlan Ver</a>
            </Button>
          </div>
        ) : listings.length === 0 && !loading && error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>Sayfayı Yenile</Button>
              <Button asChild variant="outline">
                <a href="/ilan-ver">İlan Ver</a>
              </Button>
            </div>
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
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}>
                  Önceki
                </Button>
                <span className="px-4 py-2 flex items-center">
                  Sayfa {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
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

export default function IlanlarClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </div>
        </div>
      }
    >
      <IlanlarContent />
    </Suspense>
  );
}

