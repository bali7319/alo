'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Search, Trash2, CheckCircle, XCircle, Download, ArrowLeft, Send } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminAbonelerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/subscribers?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSubscribers(data.subscribers || []);
        setPagination(data.pagination || pagination);
      } else {
        console.error('Aboneler getirme hatası:', data.error);
      }
    } catch (error) {
      console.error('Aboneler getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      router.push('/giris?callbackUrl=/admin/aboneler');
      return;
    }

    fetchSubscribers();
  }, [session, status, router, pagination.page, statusFilter]);

  // Search için ayrı useEffect (debounce ile)
  useEffect(() => {
    if (status === 'loading') return;
    
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') return;

    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchSubscribers();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu aboneliği silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/admin/subscribers?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        // Aboneleri yeniden yükle
        fetchSubscribers();
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      console.error('Abonelik silme hatası:', error);
      alert('Abonelik silinirken bir hata oluştu');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingId(id);
      const response = await fetch('/api/admin/subscribers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Aboneleri yeniden yükle
        fetchSubscribers();
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      console.error('Abonelik durumu güncelleme hatası:', error);
      alert('Abonelik durumu güncellenirken bir hata oluştu');
    } finally {
      setTogglingId(null);
    }
  };

  const handleExport = () => {
    // CSV formatında export
    const csv = [
      ['Email', 'Durum', 'Kayıt Tarihi'].join(','),
      ...subscribers.map((s) => [
        s.email,
        s.isActive ? 'Aktif' : 'Pasif',
        new Date(s.createdAt).toLocaleDateString('tr-TR'),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `aboneler_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search zaten useEffect ile yönetiliyor, sadece form submit'i engelle
  };

  const handleTestEmail = async () => {
    const email = prompt('Test email göndermek için email adresini girin:');
    if (!email) return;

    const subject = prompt('Email konusu:', 'Test Email');
    if (subject === null) return;

    const message = prompt('Özel mesaj (isteğe bağlı):', '');

    try {
      setTestingEmail(true);
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: subject || 'Test Email',
          message: message || '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Test email başarıyla gönderildi!\n\nAlıcı: ${data.to}\nKonu: ${data.subject}`);
      } else {
        alert(`❌ Hata: ${data.error}`);
      }
    } catch (error) {
      console.error('Test email hatası:', error);
      alert('Test email gönderilirken bir hata oluştu');
    } finally {
      setTestingEmail(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Admin Paneli
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Aboneleri</h1>
              <p className="mt-2 text-gray-600">
                Toplam {pagination.total} abone
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleTestEmail}
                disabled={testingEmail}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                {testingEmail ? 'Gönderiliyor...' : 'Test Email Gönder'}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV İndir
              </button>
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Email ile ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ara
            </button>
          </form>
        </div>

        {/* Aboneler Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Abone bulunamadı
                    </td>
                  </tr>
                ) : (
                  subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {subscriber.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subscriber.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {subscriber.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Pasif
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(subscriber.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(subscriber.id, subscriber.isActive)}
                            disabled={togglingId === subscriber.id}
                            className={`px-3 py-1 rounded-md text-xs transition-colors ${
                              subscriber.isActive
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            } disabled:opacity-50`}
                          >
                            {togglingId === subscriber.id
                              ? '...'
                              : subscriber.isActive
                              ? 'Pasif Et'
                              : 'Aktif Et'}
                          </button>
                          <button
                            onClick={() => handleDelete(subscriber.id)}
                            disabled={deletingId === subscriber.id}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            {deletingId === subscriber.id ? (
                              '...'
                            ) : (
                              <>
                                <Trash2 className="h-3 w-3 inline mr-1" />
                                Sil
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Sayfa {pagination.page} / {pagination.totalPages} (Toplam {pagination.total} abone)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (pagination.page > 1) {
                      setPagination({ ...pagination, page: pagination.page - 1 });
                    }
                  }}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Önceki
                </button>
                <button
                  onClick={() => {
                    if (pagination.page < pagination.totalPages) {
                      setPagination({ ...pagination, page: pagination.page + 1 });
                    }
                  }}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
