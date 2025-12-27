'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, FileText } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  type: string;
  content: string;
  version: string;
  isActive: boolean;
  isRequired: boolean;
  language: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SozlesmeDetayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      router.push(`/giris?callbackUrl=${encodeURIComponent(`/admin/sozlesmeler/${contractId}`)}`);
      return;
    }

    fetchContract();
  }, [session, status, router, contractId]);

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/admin/contracts/${contractId}`);
      if (!response.ok) {
        throw new Error('Sözleşme yüklenemedi');
      }
      const data = await response.json();
      setContract(data);
    } catch (err) {
      console.error('Sözleşme yükleme hatası:', err);
      alert('Sözleşme yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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

  if (!contract) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Sözleşme bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/sozlesmeler"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
            <p className="mt-2 text-gray-600">
              {getTypeLabel(contract.type)} • v{contract.version} • {contract.language.toUpperCase()}
            </p>
          </div>
        </div>
        <Link
          href={`/admin/sozlesmeler/${contractId}/duzenle`}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="h-5 w-5 mr-2" />
          Düzenle
        </Link>
      </div>

      {/* Bilgiler */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Durum</p>
            <p className="text-sm font-medium text-gray-900">
              {contract.isActive ? (
                <span className="text-green-600">Aktif</span>
              ) : (
                <span className="text-gray-600">Pasif</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Zorunlu</p>
            <p className="text-sm font-medium text-gray-900">
              {contract.isRequired ? (
                <span className="text-red-600">Evet</span>
              ) : (
                <span className="text-gray-600">Hayır</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Oluşturulma</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(contract.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Güncelleme</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(contract.updatedAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
        {contract.expiresAt && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">Son Geçerlilik</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(contract.expiresAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">Sözleşme İçeriği</h2>
        </div>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: contract.content }}
        />
      </div>
    </div>
  );
}

