'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function YeniSozlesmePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'general',
    content: '',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    expiresAt: '',
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  if (!session || userRole !== 'admin') {
    router.push(`/giris?callbackUrl=${encodeURIComponent('/admin/sozlesmeler/yeni')}`);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/contracts', {
        method: 'POST',
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
        throw new Error(error.error || 'Sözleşme oluşturulamadı');
      }

      router.push('/admin/sozlesmeler');
    } catch (err: any) {
      alert(err.message || 'Sözleşme oluşturulurken hata oluştu');
      console.error('Sözleşme oluşturma hatası:', err);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Yeni Sözleşme</h1>
          <p className="mt-2 text-gray-600">Yeni bir sözleşme oluşturun</p>
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
            placeholder="Örn: Kullanıcı Sözleşmesi"
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
              <option value="commercial">İşyeri Kiralama</option>
              <option value="vehicle">Araç Kiralama</option>
              <option value="warehouse">Depo Kiralama</option>
              <option value="sale">Satış Sözleşmesi</option>
              <option value="service">Hizmet Sözleşmesi</option>
              <option value="partnership">Ortaklık Sözleşmesi</option>
              <optgroup label="Konut ve Gayrimenkul">
                <option value="housing-transfer">Konut Devir Protokolü</option>
                <option value="sublease-approval">Alt Kira Onay Mektubu</option>
                <option value="furnished-housing">Eşyalı Konut Kira Sözleşmesi</option>
                <option value="eviction-petition">Tahliye Dava Dilekçesi</option>
                <option value="rent-determination">Kira Tespit Dava Dilekçesi</option>
                <option value="construction-agreement">Kat Karşılığı Bina Yapım</option>
                <option value="rent-increase-objection">Kira Artış İtiraz Mektubu</option>
                <option value="rent-renewal">Kira Yenileme Sözleşmesi</option>
                <option value="eviction-notice">Tahliye İhtarname</option>
                <option value="sublease">Alt Kira Anlaşması</option>
                <option value="rent-increase-notice">Kira Artış İhtarname</option>
                <option value="rent-termination">Kira Fesih Protokolü</option>
                <option value="deposit-refund">Depozito İade Talebi</option>
                <option value="rent-receipt">Kira Ödeme Belgesi</option>
                <option value="tenant-termination">Kiracı Fesih Bildirimi</option>
                <option value="rent-delay-notice">Kira Gecikme İhtarname</option>
                <option value="renovation-request">Tadilat Talebi</option>
              </optgroup>
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
              placeholder="1.0"
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
              value={formData.expiresAt}
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
            placeholder="Sözleşme içeriğini buraya yazın. HTML veya Markdown kullanabilirsiniz."
          />
          <p className="mt-2 text-sm text-gray-500">
            HTML etiketleri veya Markdown formatı kullanabilirsiniz.
          </p>
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
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}

