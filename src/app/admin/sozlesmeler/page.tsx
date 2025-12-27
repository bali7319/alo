'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, Edit, Trash2, Eye, CheckCircle, XCircle, Search } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  type: string;
  version: string;
  isActive: boolean;
  isRequired: boolean;
  language: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSozlesmelerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      router.push(`/giris?callbackUrl=${encodeURIComponent('/admin/sozlesmeler')}`);
      return;
    }

    fetchContracts();
  }, [session, status, router]);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/admin/contracts');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Sözleşmeler yüklenemedi');
      }
      const data = await response.json();
      setContracts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const errorMessage = err.message || 'Sözleşmeler yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('Sözleşmeler yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sözleşmeyi silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/contracts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Sözleşme silinemedi');
      }

      setContracts(contracts.filter(c => c.id !== id));
    } catch (err) {
      alert('Sözleşme silinirken hata oluştu');
      console.error('Sözleşme silme hatası:', err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/contracts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Sözleşme durumu güncellenemedi');
      }

      setContracts(contracts.map(c => 
        c.id === id ? { ...c, isActive: !currentStatus } : c
      ));
    } catch (err) {
      alert('Sözleşme durumu güncellenirken hata oluştu');
      console.error('Sözleşme güncelleme hatası:', err);
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'user': 'Kullanıcı Sözleşmesi',
      'seller': 'Satıcı Sözleşmesi',
      'buyer': 'Alıcı Sözleşmesi',
      'premium': 'Premium Üyelik',
      'general': 'Genel Şartlar',
      'privacy': 'Gizlilik Politikası',
      'terms': 'Kullanım Şartları',
    };
    return types[type] || type;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Hata</h3>
          <p className="text-red-700">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            Eğer bu hata devam ederse, terminal'de şu komutu çalıştırın:
            <code className="block mt-1 bg-red-100 p-2 rounded">npx prisma migrate dev</code>
          </p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchContracts();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sözleşmeler</h1>
          <p className="mt-2 text-gray-600">Sözleşmeleri yönetin ve düzenleyin</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/admin/sozlesmeler/ev-kiralama"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileText className="h-5 w-5 mr-2" />
            Ev Kiralama Sözleşmesi
          </Link>
          <Link
            href="/admin/sozlesmeler/yeni"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Sözleşme
          </Link>
        </div>
      </div>

      {/* Arama */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Sözleşme ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Sözleşmeler Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Versiyon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zorunlu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz sözleşme yok'}
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contract.title}</div>
                          <div className="text-sm text-gray-500">{contract.language.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {getTypeLabel(contract.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      v{contract.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(contract.id, contract.isActive)}
                        className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          contract.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {contract.isActive ? (
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
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contract.isRequired ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Zorunlu
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Opsiyonel
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contract.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/sozlesmeler/${contract.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/sozlesmeler/${contract.id}/duzenle`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(contract.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

