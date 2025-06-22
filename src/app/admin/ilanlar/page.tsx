'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Listing {
  id: string;
  title: string;
  price: number;
  approvalStatus: string;
  isActive: boolean;
  createdAt: string;
  expiryDate: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function AdminIlanlarPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchListings = async () => {
    setLoading(true);
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
        setListings(data.listings);
        setTotalPages(data.totalPages);
      } else {
        console.error('Hata:', data.error);
      }
    } catch (error) {
      console.error('API hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [status, page]);

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

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
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

      {/* İlanlar Tablosu */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b">Başlık</th>
              <th className="p-3 border-b">Fiyat</th>
              <th className="p-3 border-b">Kullanıcı</th>
              <th className="p-3 border-b">Durum</th>
              <th className="p-3 border-b">Tarih</th>
              <th className="p-3 border-b">Aksiyonlar</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="p-3 border-b">{listing.title}</td>
                <td className="p-3 border-b">{listing.price.toLocaleString('tr-TR')} ₺</td>
                <td className="p-3 border-b">
                  <div>
                    <div className="font-medium">{listing.user.name}</div>
                    <div className="text-sm text-gray-500">{listing.user.email}</div>
                  </div>
                </td>
                <td className="p-3 border-b">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(listing.approvalStatus)}`}>
                    {getStatusText(listing.approvalStatus)}
                  </span>
                </td>
                <td className="p-3 border-b">
                  {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="p-3 border-b">
                  <div className="flex gap-2 flex-wrap">
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const days = prompt('Kaç gün uzatmak istiyorsunuz?');
                        if (days && !isNaN(Number(days))) {
                          handleAction(listing.id, 'extend', Number(days));
                        }
                      }}
                    >
                      Süre Uzat
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
            ))}
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
