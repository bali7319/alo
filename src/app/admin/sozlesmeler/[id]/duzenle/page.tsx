'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  type: string;
  content: string;
  version: string;
  isActive: boolean;
  isRequired: boolean;
  language: string;
  expiresAt: string | null;
}

export default function DuzenleSozlesmePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Contract>({
    id: '',
    title: '',
    type: 'general',
    content: '',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    expiresAt: null,
  });

  useEffect(() => {
    if (status === 'loading') return;

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      router.push(`/giris?callbackUrl=${encodeURIComponent(`/admin/sozlesmeler/${contractId}/duzenle`)}`);
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
      setFormData({
        ...data,
        expiresAt: data.expiresAt ? data.expiresAt.split('T')[0] : '',
      });
    } catch (err) {
      console.error('Sözleşme yükleme hatası:', err);
      alert('Sözleşme yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sözleşme güncellenemedi');
      }

      router.push('/admin/sozlesmeler');
    } catch (err: any) {
      alert(err.message || 'Sözleşme güncellenirken hata oluştu');
      console.error('Sözleşme güncelleme hatası:', err);
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/sozlesmeler"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sözleşme Düzenle</h1>
          <p className="mt-2 text-gray-600">{formData.title}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Başlık */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Başlık *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tip ve Versiyon */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Tip *
            </label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">Genel Şartlar</option>
              <option value="user">Kullanıcı Sözleşmesi</option>
              <option value="seller">Satıcı Sözleşmesi</option>
              <option value="buyer">Alıcı Sözleşmesi</option>
              <option value="premium">Premium Üyelik</option>
              <option value="privacy">Gizlilik Politikası</option>
              <option value="terms">Kullanım Şartları</option>
            </select>
          </div>
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
              Versiyon *
            </label>
            <input
              type="text"
              id="version"
              required
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Dil ve Durum */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Dil *
            </label>
            <select
              id="language"
              required
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
              Son Geçerlilik Tarihi (Opsiyonel)
            </label>
            <input
              type="date"
              id="expiresAt"
              value={formData.expiresAt || ''}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Durumlar */}
        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Aktif</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isRequired}
              onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Zorunlu</span>
          </label>
        </div>

        {/* İçerik */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            İçerik *
          </label>
          <textarea
            id="content"
            required
            rows={20}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
        </div>

        {/* Butonlar */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Link
            href="/admin/sozlesmeler"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}

