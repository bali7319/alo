'use client';

import { useState, useEffect } from 'react';
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
  // İsteğe bağlı özellik fiyatları
  extendedDurationPrice: number;
  morePhotosPrice: number;
}

export default function AdminAyarlarPage() {
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
    // İsteğe bağlı özellik fiyatları
    extendedDurationPrice: 25,
    morePhotosPrice: 19
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (response.ok) {
        setSettings({ ...settings, ...data });
      } else {
        console.error('Hata:', data.error);
      }
    } catch (error) {
      console.error('API hatası:', error);
    } finally {
      setLoading(false);
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
        alert('Ayarlar başarıyla güncellendi! İlan ver sayfasındaki fiyatlar otomatik olarak güncellenecek.');
      } else {
        alert('Hata: ' + data.error);
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Kaydetme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Premium İlan Ayarları</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Premium İlan Paketleri */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Crown className="h-6 w-6 text-yellow-500 mr-2" />
              Premium İlan Paketleri
            </h2>
            
            <div className="space-y-6">
              {/* Premium İlan */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  Premium İlan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      value={settings.premiumPrice}
                      onChange={(e) => setSettings({
                        ...settings,
                        premiumPrice: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Süre (Gün)
                    </label>
                    <input
                      type="number"
                      value={settings.premiumDuration}
                      onChange={(e) => setSettings({
                        ...settings,
                        premiumDuration: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Öne Çıkan İlan */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                  Öne Çıkan İlan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      value={settings.featuredPrice}
                      onChange={(e) => setSettings({
                        ...settings,
                        featuredPrice: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Süre (Gün)
                    </label>
                    <input
                      type="number"
                      value={settings.featuredDuration}
                      onChange={(e) => setSettings({
                        ...settings,
                        featuredDuration: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Acil İlan */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Zap className="h-5 w-5 text-red-500 mr-2" />
                  Acil İlan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      value={settings.urgentPrice}
                      onChange={(e) => setSettings({
                        ...settings,
                        urgentPrice: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Süre (Gün)
                    </label>
                    <input
                      type="number"
                      value={settings.urgentDuration}
                      onChange={(e) => setSettings({
                        ...settings,
                        urgentDuration: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Vurgulanmış İlan */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Eye className="h-5 w-5 text-blue-500 mr-2" />
                  Vurgulanmış İlan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      value={settings.highlightPrice}
                      onChange={(e) => setSettings({
                        ...settings,
                        highlightPrice: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Süre (Gün)
                    </label>
                    <input
                      type="number"
                      value={settings.highlightDuration}
                      onChange={(e) => setSettings({
                        ...settings,
                        highlightDuration: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* En Üstte İlan */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
                  En Üstte İlan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      value={settings.topPrice}
                      onChange={(e) => setSettings({
                        ...settings,
                        topPrice: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Süre (Gün)
                    </label>
                    <input
                      type="number"
                      value={settings.topDuration}
                      onChange={(e) => setSettings({
                        ...settings,
                        topDuration: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Paket Fiyatları */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Crown className="h-6 w-6 text-yellow-500 mr-2" />
              Premium Paket Fiyatları
            </h2>
            
            <div className="space-y-6">
              {/* Aylık Premium */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Star className="h-5 w-5 text-blue-500 mr-2" />
                  Aylık Premium
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    value={settings.monthlyPremiumPrice}
                    onChange={(e) => setSettings({
                      ...settings,
                      monthlyPremiumPrice: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* 3 Aylık Premium */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Star className="h-5 w-5 text-green-500 mr-2" />
                  3 Aylık Premium
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    value={settings.quarterlyPremiumPrice}
                    onChange={(e) => setSettings({
                      ...settings,
                      quarterlyPremiumPrice: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Yıllık Premium */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Star className="h-5 w-5 text-purple-500 mr-2" />
                  Yıllık Premium
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    value={settings.yearlyPremiumPrice}
                    onChange={(e) => setSettings({
                      ...settings,
                      yearlyPremiumPrice: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* İsteğe Bağlı Özellikler */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Zap className="h-6 w-6 text-orange-500 mr-2" />
              İsteğe Bağlı Özellikler
            </h2>
            
            <div className="space-y-6">
              {/* Uzatılmış Süre */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                  Uzatılmış Süre
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    value={settings.extendedDurationPrice}
                    onChange={(e) => setSettings({
                      ...settings,
                      extendedDurationPrice: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    30 gün daha uzatma fiyatı
                  </p>
                </div>
              </div>

              {/* Ek Fotoğraflar */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Eye className="h-5 w-5 text-indigo-500 mr-2" />
                  Ek Fotoğraflar
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    value={settings.morePhotosPrice}
                    onChange={(e) => setSettings({
                      ...settings,
                      morePhotosPrice: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    5 adet daha fotoğraf ekleme fiyatı
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Genel Ayarlar */}
          <div className="space-y-6">
            {/* Temel Ayarlar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Calendar className="h-6 w-6 text-blue-500 mr-2" />
                Temel Ayarlar
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Normal İlan Süresi (Gün)
                  </label>
                  <input
                    type="number"
                    value={settings.regularDuration}
                    onChange={(e) => setSettings({
                      ...settings,
                      regularDuration: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ücretsiz ilanların yayın süresi
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Normal İlan Maksimum Resim Sayısı
                  </label>
                  <input
                    type="number"
                    value={settings.maxImages}
                    onChange={(e) => setSettings({
                      ...settings,
                      maxImages: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium İlan Maksimum Resim Sayısı
                  </label>
                  <input
                    type="number"
                    value={settings.premiumMaxImages}
                    onChange={(e) => setSettings({
                      ...settings,
                      premiumMaxImages: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Otomatik Yenileme İndirimi (%)
                  </label>
                  <input
                    type="number"
                    value={settings.autoRenewalDiscount}
                    onChange={(e) => setSettings({
                      ...settings,
                      autoRenewalDiscount: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Premium ilanları otomatik yenileyen kullanıcılara verilecek indirim
                  </p>
                </div>
              </div>
            </div>

            {/* Fiyat Özeti */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <DollarSign className="h-6 w-6 text-green-500 mr-2" />
                Fiyat Özeti
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium">Premium İlan:</span>
                  <span className="text-sm text-gray-600">{settings.premiumPrice} TL ({settings.premiumDuration} gün)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium">Öne Çıkan İlan:</span>
                  <span className="text-sm text-gray-600">{settings.featuredPrice} TL ({settings.featuredDuration} gün)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium">Acil İlan:</span>
                  <span className="text-sm text-gray-600">{settings.urgentPrice} TL ({settings.urgentDuration} gün)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium">Vurgulanmış İlan:</span>
                  <span className="text-sm text-gray-600">{settings.highlightPrice} TL ({settings.highlightDuration} gün)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium">En Üstte İlan:</span>
                  <span className="text-sm text-gray-600">{settings.topPrice} TL ({settings.topDuration} gün)</span>
                </div>
                
                {/* Premium Paketler */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Premium Paketler</h4>
                  <div className="space-y-2">
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
                
                {/* İsteğe Bağlı Özellikler */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">İsteğe Bağlı Özellikler</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uzatılmış Süre:</span>
                      <span className="text-sm text-gray-600">{settings.extendedDurationPrice} TL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Ek Fotoğraflar:</span>
                      <span className="text-sm text-gray-600">{settings.morePhotosPrice} TL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kaydet Butonu */}
            <div className="bg-white rounded-lg shadow p-6">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg"
              >
                {saving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
              </Button>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Değişiklikler anında sitede aktif olacaktır
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
