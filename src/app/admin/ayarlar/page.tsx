'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Star, Zap, Crown, TrendingUp, Eye, MessageSquare, Calendar, DollarSign } from 'lucide-react';

interface Settings {
  premiumPrice: number;
  premiumDuration: number;
  regularDuration: number;
  featuredPrice: number;
  featuredDuration: number;
  urgentPrice: number;
  urgentDuration: number;
  highlightPrice: number;
  highlightDuration: number;
  topPrice: number;
  topDuration: number;
  maxImages: number;
  premiumMaxImages: number;
  autoRenewalDiscount: number;
  // Premium paket fiyatları
  monthlyPremiumPrice: number;
  quarterlyPremiumPrice: number;
  yearlyPremiumPrice: number;
  nonePremiumPrice: number; // Ücretsiz plan fiyatı (genelde 0)
  // İsteğe bağlı özellik fiyatları
  extendedDurationPrice: number;
  morePhotosPrice: number;
  // Yıllık premium limitleri
  yearlyMaxListings: number;
  yearlyMaxTotalImages: number;
  // Plan bazlı resim limitleri
  noneMaxImages: number;
  monthlyMaxImages: number;
  quarterlyMaxImages: number;
  yearlyMaxImagesPerListing: number;
  // Plan bazlı ilan limitleri
  noneMaxListings: number; // Ücretsiz plan için
  monthlyMaxListings: number; // Aylık plan için
  quarterlyMaxListings: number; // 3 Aylık plan için
  // Plan bazlı toplam resim limitleri
  noneMaxTotalImages: number; // Ücretsiz plan için
  monthlyMaxTotalImages: number; // Aylık plan için
  quarterlyMaxTotalImages: number; // 3 Aylık plan için
}

export default function AdminAyarlarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    premiumPrice: 50,
    premiumDuration: 30,
    regularDuration: 7,
    featuredPrice: 25,
    featuredDuration: 15,
    urgentPrice: 15,
    urgentDuration: 7,
    highlightPrice: 10,
    highlightDuration: 5,
    topPrice: 35,
    topDuration: 20,
    maxImages: 5,
    premiumMaxImages: 10,
    autoRenewalDiscount: 10,
    // Premium paket fiyatları
    monthlyPremiumPrice: 199,
    quarterlyPremiumPrice: 494,
    yearlyPremiumPrice: 2179,
    nonePremiumPrice: 0,
    // İsteğe bağlı özellik fiyatları
    extendedDurationPrice: 25,
    morePhotosPrice: 19,
    // Yıllık premium limitleri
    yearlyMaxListings: 20,
    yearlyMaxTotalImages: 200,
    // Plan bazlı resim limitleri
    noneMaxImages: 3,
    monthlyMaxImages: 5,
    quarterlyMaxImages: 10,
    yearlyMaxImagesPerListing: 10,
    // Plan bazlı ilan limitleri
    noneMaxListings: 0,
    monthlyMaxListings: 0,
    quarterlyMaxListings: 0,
    // Plan bazlı toplam resim limitleri
    noneMaxTotalImages: 0,
    monthlyMaxTotalImages: 0,
    quarterlyMaxTotalImages: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchSettings = async (skipIfRecentSave = false) => {
    // Eğer yakın zamanda kaydetme yapıldıysa (120 saniye içinde), fetchSettings'i atla
    if (skipIfRecentSave && lastSaveTime) {
      const timeSinceSave = Date.now() - lastSaveTime;
      if (timeSinceSave < 120000) { // 120 saniye (2 dakika)
        console.log('Yakın zamanda kaydetme yapıldı, fetchSettings atlanıyor');
        return;
      }
    }
    
    // İlk yükleme değilse ve interval'den geliyorsa, sadece kontrol amaçlı çalış
    // Form state'ini değiştirme
    const isIntervalCheck = !isInitialLoad && skipIfRecentSave;
    
    if (isInitialLoad) {
    setLoading(true);
    }
    
    try {
      const response = await fetch('/api/admin/settings', {
        cache: 'no-store' // Her zaman güncel ayarları çek
      });
      const data = await response.json();
      
      // Response başarılı olsa da olmasa da, data içinde ayarlar varsa kullan
      if (data && typeof data === 'object' && !data.error) {
        // Sadece ilk yüklemede form state'ini güncelle
        if (isInitialLoad) {
        setSettings(data);
          setIsInitialLoad(false);
          setLoading(false);
        }
        // Interval check ise sadece log (form state'ini değiştirme)
        else if (isIntervalCheck) {
          console.log('Ayarlar kontrol edildi (interval), form state korunuyor');
        }
      } else if (response.ok && data && typeof data === 'object') {
        // Response başarılı ama error field'ı var, yine de ayarları kullan
        if (isInitialLoad) {
          // Error field'ını çıkar ve ayarları kullan
          const { error, ...settingsData } = data;
          if (Object.keys(settingsData).length > 0) {
            setSettings(settingsData);
          }
          setIsInitialLoad(false);
          setLoading(false);
        }
      } else {
        console.error('Hata:', data.error || 'Bilinmeyen hata');
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('API hatası:', error);
      if (isInitialLoad) {
      setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Kaydetme başarılı, kaydetme zamanını güncelle
        setLastSaveTime(Date.now());
        
        // State'i güncellemeye gerek yok - kullanıcının girdiği değerler zaten state'te
        // API'den gelen ayarlar sadece doğrulama için, form state'i korunmalı
        
        alert('Ayarlar başarıyla güncellendi! Tüm sayfalardaki (İlan Ver, Premium, vb.) fiyatlar ve limitler otomatik olarak güncellenecek.');
      } else {
        alert('Hata: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Kaydetme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') {
      return; // Hala yükleniyor
    }

    // Admin kontrolü
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      router.push(`/giris?callbackUrl=${encodeURIComponent('/admin/ayarlar')}`);
      return;
    }

    // Sadece ilk yüklemede fetchSettings çağır
    if (isInitialLoad) {
    fetchSettings();
    }
    
    // Her 60 saniyede bir admin ayarlarını kontrol et (başka sekmede değişiklik yapıldıysa)
    // Ancak yakın zamanda kaydetme yapıldıysa fetchSettings'i atla
    const interval = setInterval(() => {
      fetchSettings(true); // skipIfRecentSave = true
    }, 60000); // 60 saniye
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email, status, isInitialLoad]); // isInitialLoad değiştiğinde de kontrol et

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  if (!session || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Admin yetkisi gerekli...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ayarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8 px-2 sm:px-4">
      <div className="max-w-full mx-auto px-2 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Premium İlan Ayarları</h1>
        
        <div className="space-y-4 md:space-y-6">

            {/* Plan Bazlı Ayarlar - Tablo Formatı */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8 w-full">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 md:mb-6 flex items-center">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500 mr-2" />
                Plan Bazlı Ayarlar
              </h2>
              
              <div className="w-full overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider w-[200px]">
                        Plan
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider w-[220px]">
                        Maksimum İlan Sayısı
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider w-[240px]">
                        İlan Başına Resim Sayısı
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider w-[200px]">
                        Fiyat (TL)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Ücretsiz Plan */}
                    <tr>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="text-sm sm:text-base font-medium text-gray-900 whitespace-nowrap">Ücretsiz Plan</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.noneMaxListings || 0}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.noneMaxListings : Number(value));
                            setSettings({
                            ...settings,
                              noneMaxListings: Math.max(0, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="0"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.noneMaxImages}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.noneMaxImages : Number(value));
                            setSettings({
                            ...settings,
                              noneMaxImages: Math.max(1, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="1"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.nonePremiumPrice || 0}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.nonePremiumPrice : Number(value));
                            setSettings({
                            ...settings,
                              nonePremiumPrice: Math.max(0, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="0"
                        />
                      </td>
                    </tr>

                    {/* Aylık Premium */}
                    <tr>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="text-sm sm:text-base font-medium text-gray-900 whitespace-nowrap">Aylık Premium</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.monthlyMaxListings || 0}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.monthlyMaxListings : Number(value));
                            setSettings({
                            ...settings,
                              monthlyMaxListings: Math.max(0, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="0"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.monthlyMaxImages}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.monthlyMaxImages : Number(value));
                            setSettings({
                            ...settings,
                              monthlyMaxImages: Math.max(1, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="1"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.monthlyPremiumPrice}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.monthlyPremiumPrice : Number(value));
                            setSettings({
                            ...settings,
                              monthlyPremiumPrice: Math.max(0, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="0"
                        />
                      </td>
                    </tr>

                    {/* 3 Aylık Premium */}
                    <tr>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="text-sm sm:text-base font-medium text-gray-900 whitespace-nowrap">3 Aylık Premium</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.quarterlyMaxListings || 0}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.quarterlyMaxListings : Number(value));
                            setSettings({
                            ...settings,
                              quarterlyMaxListings: Math.max(0, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="0"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.quarterlyMaxImages}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.quarterlyMaxImages : Number(value));
                            setSettings({
                            ...settings,
                              quarterlyMaxImages: Math.max(1, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="1"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.quarterlyPremiumPrice}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.quarterlyPremiumPrice : Number(value));
                            setSettings({
                            ...settings,
                              quarterlyPremiumPrice: Math.max(0, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="0"
                        />
                      </td>
                    </tr>

                    {/* Yıllık Premium */}
                    <tr className="bg-purple-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="text-sm sm:text-base font-medium text-gray-900 whitespace-nowrap">Yıllık Premium</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.yearlyMaxListings}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.yearlyMaxListings : Number(value));
                            setSettings({
                            ...settings,
                              yearlyMaxListings: Math.max(1, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="1"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.yearlyMaxImagesPerListing}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.yearlyMaxImagesPerListing : Number(value));
                            setSettings({
                            ...settings,
                              yearlyMaxImagesPerListing: Math.max(1, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="1"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <input
                          type="number"
                          value={settings.yearlyPremiumPrice}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? settings.yearlyPremiumPrice : Number(value));
                            setSettings({
                            ...settings,
                              yearlyPremiumPrice: Math.max(0, Math.floor(numValue))
                            });
                          }}
                          className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="0"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
            </div>


          {/* Fiyat Özeti */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 md:mb-6 flex items-center">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2" />
              Fiyat Özeti
            </h2>
            
            <div className="space-y-3">
              {/* Premium Paketler */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Premium Paketler</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ücretsiz Plan:</span>
                    <span className="text-sm text-gray-600">{settings.nonePremiumPrice || 0} TL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Aylık Premium:</span>
                    <span className="text-sm text-gray-600">{settings.monthlyPremiumPrice} TL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">3 Aylık Premium:</span>
                    <span className="text-sm text-gray-600">{settings.quarterlyPremiumPrice} TL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Yıllık Premium:</span>
                    <span className="text-sm text-gray-600">{settings.yearlyPremiumPrice} TL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-medium py-2.5 sm:py-3 px-4 rounded-lg"
            >
              {saving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
            </Button>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
              Değişiklikler anında sitede aktif olacaktır
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
