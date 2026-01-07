'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { isAdmin } from '@/lib/admin-client';

interface Listing {
  id: string;
  title: string;
  price: number;
  approvalStatus: string;
  isActive: boolean;
  isPremium?: boolean;
  premiumUntil?: string | null;
  expiresAt?: string;
  createdAt: string;
  moderatorId?: string | null;
  moderatedAt?: string | null;
  moderatorNotes?: string | null;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  moderator?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function AdminIlanlarPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Session yüklenene kadar bekle
    if (sessionStatus === 'loading') {
      return;
    }

    // Admin kontrolü
    if (!isAdmin(session)) {
      router.push(`/giris?callbackUrl=${encodeURIComponent('/admin/ilanlar')}`);
      return;
    }

    // Session hazır olduğunda hemen veri çek
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, status, page]); // session ve router'ı dependency'den çıkardık

  const fetchListings = async () => {
    if (!isAdmin(session)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      if (status !== 'all') {
        params.append('status', status);
      }
      
      const response = await fetch(`/api/admin/listings?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setListings(data.listings || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('API Hatası:', data.error);
        setError(data.error || 'İlanlar yüklenirken bir hata oluştu');
        if (response.status === 401 || response.status === 403) {
          router.push(`/giris?callbackUrl=${encodeURIComponent('/admin/ilanlar')}`);
        }
      }
    } catch (error: any) {
      console.error('API hatası:', error);
      setError('İlanlar yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (listingId: string, action: string, days?: number) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, days }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('İşlem başarılı!');
        fetchListings(); // Listeyi yenile
      } else {
        alert('Hata: ' + data.error);
      }
    } catch (error) {
      console.error('İşlem hatası:', error);
      alert('İşlem sırasında hata oluştu');
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('İlan başarıyla silindi!');
        fetchListings(); // Listeyi yenile
      } else {
        alert('Hata: ' + data.error);
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme sırasında hata oluştu');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'approved': return 'Onaylandı';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Oturum kontrol ediliyor...</p>
      </div>
    );
  }

  if (!isAdmin(session)) {
    return null; // Router zaten yönlendirecek
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">İlan Yönetimi</h1>
        
        {/* Skeleton Screen - Hızlı görünüm için */}
        <div className="mb-4 flex gap-2">
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 border-b">Başlık</th>
                <th className="p-3 border-b">Fiyat</th>
                <th className="p-3 border-b">Kullanıcı</th>
                <th className="p-3 border-b">Durum</th>
                <th className="p-3 border-b">İşlem Yapan</th>
                <th className="p-3 border-b">Premium</th>
                <th className="p-3 border-b">Tarih</th>
                <th className="p-3 border-b">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-3 border-b">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </td>
                  <td className="p-3 border-b">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="p-3 border-b">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded w-24"></div>
                  </td>
                  <td className="p-3 border-b">
                    <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-12"></div>
                  </td>
                  <td className="p-3 border-b">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="p-3 border-b">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="p-3 border-b">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="p-3 border-b">
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">İlan Yönetimi</h1>
      
      {/* Filtreler */}
      <div className="mb-4 flex gap-2">
        <Button 
          variant={status === 'all' ? 'default' : 'outline'}
          onClick={() => setStatus('all')}
        >
          Tümü
        </Button>
        <Button 
          variant={status === 'pending' ? 'default' : 'outline'}
          onClick={() => setStatus('pending')}
        >
          Bekleyen
        </Button>
        <Button 
          variant={status === 'approved' ? 'default' : 'outline'}
          onClick={() => setStatus('approved')}
        >
          Onaylanan
        </Button>
        <Button 
          variant={status === 'rejected' ? 'default' : 'outline'}
          onClick={() => setStatus('rejected')}
        >
          Reddedilen
        </Button>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* İlanlar Tablosu */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b">Başlık</th>
              <th className="p-3 border-b">Fiyat</th>
              <th className="p-3 border-b">Kullanıcı</th>
              <th className="p-3 border-b">Durum</th>
              <th className="p-3 border-b">İşlem Yapan</th>
              <th className="p-3 border-b">Premium</th>
              <th className="p-3 border-b">Tarih</th>
              <th className="p-3 border-b">Aksiyonlar</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  Henüz ilan bulunmuyor.
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="p-3 border-b">
                  <div className="font-medium">{listing.title}</div>
                  <div className="text-xs text-gray-500">ID: {listing.id}</div>
                </td>
                <td className="p-3 border-b">{listing.price.toLocaleString('tr-TR')} ₺</td>
                <td className="p-3 border-b">
                  <div>
                    <div className="font-medium">{listing.user.name}</div>
                    <div className="text-sm text-gray-500">{listing.user.email}</div>
                    <div className="text-xs text-gray-400">{listing.user.phone}</div>
                  </div>
                </td>
                <td className="p-3 border-b">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(listing.approvalStatus)}`}>
                    {getStatusText(listing.approvalStatus)}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {listing.isActive ? 'Aktif' : 'Pasif'}
                  </div>
                </td>
                <td className="p-3 border-b">
                  {listing.moderator && listing.moderatedAt ? (
                    <div className="text-xs">
                      <div className="font-medium text-gray-900">
                        {listing.moderator.role === 'admin' ? '👑' : '🛡️'} {listing.moderator.name}
                      </div>
                      <div className="text-gray-500 mt-1">
                        {new Date(listing.moderatedAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-gray-400 mt-1">
                        {listing.moderator.email}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">İşlem yapılmadı</span>
                  )}
                </td>
                <td className="p-3 border-b">
                  <div className="text-xs">
                    {listing.isPremium ? 'Premium' : 'Standart'}
                  </div>
                  {listing.premiumUntil && (
                    <div className="text-xs text-gray-500">
                      {`Bitiş: ${new Date(listing.premiumUntil).toLocaleDateString('tr-TR')}`}
                    </div>
                  )}
                </td>
                <td className="p-3 border-b">
                  <div>{new Date(listing.createdAt).toLocaleDateString('tr-TR')}</div>
                  {listing.expiresAt && (
                    <div className={`text-xs ${
                      new Date(listing.expiresAt) < new Date() 
                        ? 'text-red-600 font-semibold' 
                        : new Date(listing.expiresAt) <= new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
                        ? 'text-orange-600 font-medium'
                        : 'text-gray-500'
                    }`}>
                      {`Son: ${new Date(listing.expiresAt).toLocaleDateString('tr-TR')}`}
                      {new Date(listing.expiresAt) < new Date() && ' (Süresi Dolmuş)'}
                    </div>
                  )}
                </td>
                <td className="p-3 border-b">
                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/ilan-ver/duzenle/${listing.id}`} target="_blank">
                      <Button 
                        size="sm" 
                        variant="outline"
                      >
                        Düzenle
                      </Button>
                    </Link>
                    {listing.approvalStatus === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleAction(listing.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Onayla
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleAction(listing.id, 'reject')}
                        >
                          Reddet
                        </Button>
                      </>
                    )}
                    {/* Süre uzatma butonu - süresi dolmuş veya dolmak üzere olan ilanlar için */}
                    {listing.expiresAt && new Date(listing.expiresAt) <= new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                        onClick={() => handleAction(listing.id, 'extend', 30)}
                      >
                        Süre Uzat (30g)
                      </Button>
                    )}
                    {/* Premium seçenekleri */}
                    <div className="flex gap-1">
                      {listing.isPremium ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction(listing.id, 'unpremium')}
                        >
                          Premium Kaldır
                        </Button>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300"
                            onClick={() => handleAction(listing.id, 'premium', 30)}
                          >
                            Premium (30g)
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-300"
                            onClick={() => handleAction(listing.id, 'premium', 90)}
                          >
                            Premium (3ay)
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300"
                            onClick={() => handleAction(listing.id, 'premium', 365)}
                          >
                            Premium (1yıl)
                          </Button>
                        </>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAction(listing.id, listing.isActive ? 'deactivate' : 'activate')}
                    >
                      {listing.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(listing.id)}
                    >
                      Sil
                    </Button>
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button 
            variant="outline" 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Önceki
          </Button>
          <span className="px-4 py-2">
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
    </div>
  );
} 
