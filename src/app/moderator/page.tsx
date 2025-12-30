'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, Eye, Clock, User, FileText, AlertCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  subCategory: string | null;
  phone: string | null;
  showPhone: boolean;
  images: string[];
  features: string[];
  condition: string | null;
  brand: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  moderatedAt: string | null;
  moderatorNotes: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  moderator: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export default function ModeratorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/giris?callbackUrl=/moderator');
      return;
    }

    fetchListings();
  }, [session, status, router, filter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/moderator/listings?status=${filter}&limit=50`);
      
      // Content-Type kontrolü
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('JSON olmayan response:', text.substring(0, 200));
        alert('Sunucu hatası: JSON beklenirken HTML döndü. Lütfen sayfayı yenileyin.');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        console.error('İlanlar yüklenemedi:', errorData);
        if (response.status === 401 || response.status === 403) {
          router.push('/giris?callbackUrl=/moderator');
        } else {
          alert('Hata: ' + (errorData.error || 'İlanlar yüklenemedi'));
        }
      }
    } catch (error) {
      console.error('İlan getirme hatası:', error);
      alert('İlanlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (listingId: string, action: 'approve' | 'reject') => {
    if (!confirm(action === 'approve' ? 'Bu ilanı onaylamak istediğinizden emin misiniz?' : 'Bu ilanı reddetmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/moderator/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          notes: notes[listingId] || null,
        }),
      });

      // Content-Type kontrolü
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('JSON olmayan response:', text.substring(0, 200));
        alert('Sunucu hatası: JSON beklenirken HTML döndü.');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        alert(action === 'approve' ? 'İlan onaylandı' : 'İlan reddedildi');
        fetchListings();
        setNotes({ ...notes, [listingId]: '' });
      } else {
        const data = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        alert('Hata: ' + (data.error || 'İşlem başarısız'));
      }
    } catch (error) {
      console.error('İşlem hatası:', error);
      alert('İşlem sırasında bir hata oluştu');
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subCategory: listing.subCategory || '',
      phone: listing.phone || '',
      showPhone: listing.showPhone,
      condition: listing.condition || '',
      brand: listing.brand || '',
      moderatorNotes: listing.moderatorNotes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingListing) return;

    try {
      const response = await fetch(`/api/moderator/listings/${editingListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          images: editingListing.images,
          features: editingListing.features,
        }),
      });

      // Content-Type kontrolü
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('JSON olmayan response:', text.substring(0, 200));
        alert('Sunucu hatası: JSON beklenirken HTML döndü.');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        alert('İlan başarıyla güncellendi');
        setEditingListing(null);
        fetchListings();
      } else {
        const data = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        alert('Hata: ' + (data.error || 'Güncelleme başarısız'));
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme sırasında bir hata oluştu');
    }
  };

  const filteredListings = listings.filter(listing => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        listing.title.toLowerCase().includes(search) ||
        listing.description.toLowerCase().includes(search) ||
        listing.user.email.toLowerCase().includes(search) ||
        listing.user.name?.toLowerCase().includes(search) ||
        listing.location.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Onaylandı</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Reddedildi</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Beklemede</span>;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Moderatör Paneli</h1>
          <p className="text-gray-600">Bekleyen ilanları onaylayın, reddedin veya düzenleyin</p>
        </div>

        {/* Filtreler ve Arama */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="İlan, kullanıcı veya konum ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Bekleyen
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Onaylanan
              </Button>
              <Button
                variant={filter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilter('rejected')}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reddedilen
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Tümü
              </Button>
            </div>
          </div>
        </div>

        {/* İlanlar Listesi */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">İlanlar yükleniyor...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Gösterilecek ilan bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* İlan Bilgileri */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{listing.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(listing.approvalStatus)}
                          <span className="text-gray-500 text-sm">
                            {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{listing.price.toLocaleString('tr-TR')} TL</p>
                        <p className="text-sm text-gray-500">{listing.location}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">{listing.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Kategori:</span>
                        <p className="font-medium">{listing.category}</p>
                        {listing.subCategory && (
                          <p className="text-gray-600">{listing.subCategory}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Kullanıcı:</span>
                        <p className="font-medium">{listing.user.name || listing.user.email}</p>
                        <p className="text-gray-600 text-xs">{listing.user.email}</p>
                      </div>
                      {listing.moderator && (
                        <div>
                          <span className="text-gray-500">Moderatör:</span>
                          <p className="font-medium">{listing.moderator.name || listing.moderator.email}</p>
                          {listing.moderatedAt && (
                            <p className="text-gray-600 text-xs">
                              {new Date(listing.moderatedAt).toLocaleDateString('tr-TR')}
                            </p>
                          )}
                        </div>
                      )}
                      {listing.moderatorNotes && (
                        <div>
                          <span className="text-gray-500">Notlar:</span>
                          <p className="text-gray-700 text-xs">{listing.moderatorNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Resimler */}
                    {listing.images && listing.images.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {listing.images.slice(0, 4).map((img, idx) => (
                          <div key={idx} className="relative w-20 h-20">
                            <Image
                              src={img}
                              alt={`${listing.title} - ${idx + 1}`}
                              fill
                              sizes="80px"
                              className="object-cover rounded"
                              loading="lazy"
                            />
                          </div>
                        ))}
                        {listing.images.length > 4 && (
                          <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-600">
                            +{listing.images.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notlar */}
                    {listing.approvalStatus === 'pending' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Moderator Notları (Opsiyonel)
                        </label>
                        <textarea
                          value={notes[listing.id] || ''}
                          onChange={(e) => setNotes({ ...notes, [listing.id]: e.target.value })}
                          placeholder="İlan hakkında notlarınızı buraya yazabilirsiniz..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>

                  {/* İşlem Butonları */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    {listing.approvalStatus === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleAction(listing.id, 'approve')}
                          className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Onayla
                        </Button>
                        <Button
                          onClick={() => handleAction(listing.id, 'reject')}
                          variant="destructive"
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reddet
                        </Button>
                        <Button
                          onClick={() => handleEdit(listing)}
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Düzenle
                        </Button>
                      </>
                    )}
                    <Link href={`/ilan/${listing.id}`} target="_blank">
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        Görüntüle
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Düzenleme Modal */}
        {editingListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">İlan Düzenle</h2>
                  <Button variant="outline" onClick={() => setEditingListing(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık *</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama *</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (TL) *</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Konum *</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alt Kategori</label>
                      <input
                        type="text"
                        value={editForm.subCategory}
                        onChange={(e) => setEditForm({ ...editForm, subCategory: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                      <select
                        value={editForm.condition}
                        onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seçin</option>
                        <option value="Yeni">Yeni</option>
                        <option value="İkinci El">İkinci El</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
                    <input
                      type="text"
                      value={editForm.brand}
                      onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Marka adı"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showPhone"
                      checked={editForm.showPhone}
                      onChange={(e) => setEditForm({ ...editForm, showPhone: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="showPhone" className="text-sm font-medium text-gray-700">
                      Telefon numarasını göster
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moderator Notları</label>
                    <textarea
                      value={editForm.moderatorNotes}
                      onChange={(e) => setEditForm({ ...editForm, moderatorNotes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Düzenleme hakkında notlar..."
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button variant="outline" onClick={() => setEditingListing(null)}>
                      İptal
                    </Button>
                    <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                      Kaydet
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

