'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { contractTemplates } from '@/lib/contract-templates';

function YeniSozlesmeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '',
    type: typeFromUrl || 'general',
    content: '',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    expiresAt: '',
  });

  // Template varsa varsayılan form verilerini yükle
  useEffect(() => {
    const currentType = typeFromUrl || formData.type;
    if (currentType && contractTemplates[currentType]) {
      const template = contractTemplates[currentType];
      const defaultData = template.getDefaultFormData();
      setFormData((prev: any) => {
        // Eğer type değiştiyse, sadece template verilerini yükle
        if (prev.type !== currentType) {
          return {
            title: prev.title || '',
            type: currentType,
            version: prev.version || '1.0',
            isActive: prev.isActive ?? true,
            isRequired: prev.isRequired ?? false,
            language: prev.language || 'tr',
            expiresAt: prev.expiresAt || '',
            content: prev.content || '',
            ...defaultData,
          };
        }
        return prev;
      });
    }
  }, [typeFromUrl]);

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

  const template = typeFromUrl ? contractTemplates[typeFromUrl] : null;
  const hasTemplate = !!template;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/sozlesmeler"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yeni Sözleşme</h1>
                <p className="text-sm text-gray-600">Yeni bir sözleşme oluşturun</p>
              </div>
            </div>
            {hasTemplate && (
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="h-5 w-5 mr-2" />
                Yazdır
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-1">
          {/* Sol Taraf - Form */}
          <div className="print:hidden lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {hasTemplate ? (
                // Template varsa template form alanlarını göster
                <>
                  {/* Temel Bilgiler */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Temel Bilgiler
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                          Başlık *
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          required
                          value={formData.title || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Örn: Tahliye Dava Dilekçesi"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
                            Versiyon *
                          </label>
                          <input
                            type="text"
                            id="version"
                            name="version"
                            required
                            value={formData.version || '1.0'}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                            Dil *
                          </label>
                          <select
                            id="language"
                            name="language"
                            required
                            value={formData.language || 'tr'}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="tr">Türkçe</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Template Form Alanları */}
                  {template.getFormFields(formData, handleInputChange)}
                  
                  {/* Durumlar */}
                  <div className="flex space-x-6 pt-4 border-t">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive ?? true}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Aktif</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isRequired"
                        checked={formData.isRequired ?? false}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Zorunlu</span>
                    </label>
                  </div>
                </>
              ) : (
                // Template yoksa normal form
                <>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Başlık *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Örn: Kullanıcı Sözleşmesi"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Tip *
                      </label>
                      <select
                        id="type"
                        name="type"
                        required
                        value={formData.type}
                        onChange={handleInputChange}
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
                        name="version"
                        required
                        value={formData.version}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1.0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                        Dil *
                      </label>
                      <select
                        id="language"
                        name="language"
                        required
                        value={formData.language}
                        onChange={handleInputChange}
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
                        name="expiresAt"
                        value={formData.expiresAt}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Aktif</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isRequired"
                        checked={formData.isRequired}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Zorunlu</span>
                    </label>
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      İçerik *
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      required
                      rows={15}
                      value={formData.content}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="Sözleşme içeriğini buraya yazın. HTML veya Markdown kullanabilirsiniz."
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      HTML etiketleri veya Markdown formatı kullanabilirsiniz.
                    </p>
                  </div>
                </>
              )}

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

          {/* Sağ Taraf - Ön İzleme */}
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-100px)] lg:col-span-1 print:w-full">
            <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:p-0 print:w-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              {hasTemplate ? (
                // Template varsa template önizlemesini göster
                <div className="print:w-full preview-container" style={{
                  transform: 'scale(0.65)',
                  transformOrigin: 'top center',
                  width: '153.85%',
                  marginLeft: '-26.92%'
                }}>
                  {template.renderPreview(formData)}
                </div>
              ) : (
                // Template yoksa içerik önizlemesi
                <div className="print:w-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Önizleme</h3>
                  {formData.content ? (
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm">İçerik yazıldığında önizleme burada görünecek</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            height: auto !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .preview-container {
            transform: none !important;
            width: 100% !important;
            margin-left: 0 !important;
          }
          .a4-container, .a4-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20mm !important;
            width: 210mm !important;
            min-height: auto !important;
            max-height: 297mm !important;
            page-break-after: always;
            display: block !important;
            background: white !important;
          }
          .a4-container:last-child, .a4-page:last-child {
            page-break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

