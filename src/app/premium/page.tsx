'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Check, Star, Eye, TrendingUp, Clock, Camera, Zap, Crown, MessageSquare, Shield } from 'lucide-react';

export default function PremiumPage() {
  const { data: session } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Ayarlar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const plans = {
    monthly: {
      price: settings?.monthlyPremiumPrice || 199,
      period: 'ay',
      days: 30,
      features: [
        'İlan öne çıkarma',
        'Premium rozeti',
        'Öncelikli destek',
        '5 adet resim yükleme',
        'Reklamsız deneyim'
      ]
    },
    quarterly: {
      price: settings?.quarterlyPremiumPrice || 494,
      period: '3 ay',
      days: 90,
      features: [
        'İlan öne çıkarma',
        'Premium rozeti',
        'Öncelikli destek',
        '10 adet resim yükleme',
        'Reklamsız deneyim',
        '1 ay bedava'
      ]
    },
    yearly: {
      price: settings?.yearlyPremiumPrice || 2179,
      period: 'yıl',
      days: 365,
      features: [
        'İlan öne çıkarma',
        'Premium rozeti',
        'Öncelikli destek',
        'Sınırsız resim yükleme',
        'Reklamsız deneyim',
        '3 ay bedava',
        'Özel destek hattı'
      ]
    }
  };

  const optionalFeatures = [
    {
      id: 'featured',
      name: 'Öne Çıkan İlan',
      description: 'İlanınız ana sayfada öne çıkarılır',
      price: settings?.featuredPrice || 49,
      icon: Eye,
      color: 'text-blue-500'
    },
    {
      id: 'urgent',
      name: 'Acil Satılık',
      description: 'İlanınız acil kategorisinde gösterilir',
      price: settings?.urgentPrice || 29,
      icon: Zap,
      color: 'text-red-500'
    },
    {
      id: 'highlight',
      name: 'Vurgulanmış İlan',
      description: 'İlanınız renkli çerçeve ile vurgulanır',
      price: settings?.highlightPrice || 39,
      icon: Crown,
      color: 'text-yellow-500'
    },
    {
      id: 'top',
      name: 'En Üstte Göster',
      description: 'İlanınız kategorisinde en üstte gösterilir',
      price: settings?.topPrice || 59,
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      id: 'extended',
      name: 'Uzatılmış Süre',
      description: 'İlanınız 30 gün daha uzatılır',
      price: settings?.extendedDurationPrice || 25,
      icon: Clock,
      color: 'text-purple-500'
    },
    {
      id: 'more-photos',
      name: 'Ek Fotoğraflar',
      description: '5 adet daha fotoğraf ekleme hakkı',
      price: settings?.morePhotosPrice || 19,
      icon: Camera,
      color: 'text-indigo-500'
    }
  ];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const getSelectedFeaturesTotal = () => {
    return selectedFeatures.reduce((total, featureId) => {
      const feature = optionalFeatures.find(f => f.id === featureId);
      return total + (feature?.price || 0);
    }, 0);
  };

  const handleSubscribe = async () => {
    if (!session?.user) {
      alert('Premium üyelik için giriş yapmalısınız');
      return;
    }

    const basePrice = parseFloat(plans[selectedPlan].price.toString());
    const featuresTotal = getSelectedFeaturesTotal();
    const totalPrice = basePrice + featuresTotal;

    console.log('Seçilen plan:', selectedPlan);
    console.log('Seçilen özellikler:', selectedFeatures);
    console.log('Toplam fiyat:', totalPrice);
    
    alert(`${totalPrice.toFixed(2)} TL tutarındaki ${plans[selectedPlan].period} planı ve seçilen özellikler seçildi`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Premium Üyelik</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            30 gün ücretsiz ilan paylaşımından sonra premium üyelik avantajlarından yararlanın
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Plan Seçici */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
              <button
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setSelectedPlan('monthly')}
              >
                Aylık
              </button>
              <button
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  selectedPlan === 'quarterly'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setSelectedPlan('quarterly')}
              >
                3 Aylık
              </button>
              <button
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  selectedPlan === 'yearly'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setSelectedPlan('yearly')}
              >
                Yıllık
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Premium Plan Kartı */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Star className="w-4 h-4 mr-2" />
                  En Popüler
                </div>
                <h2 className="text-5xl font-bold text-gray-900 mb-2">
                  {plans[selectedPlan].price} TL
                </h2>
                <p className="text-gray-600 text-lg">
                  / {plans[selectedPlan].period} ({plans[selectedPlan].days} gün)
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {plans[selectedPlan].features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Toplam:</span>
                  <span className="text-2xl text-blue-600">
                    {(parseFloat(plans[selectedPlan].price.toString()) + getSelectedFeaturesTotal()).toFixed(2)} TL
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Premium'a Geç
              </button>
            </div>

            {/* İsteğe Bağlı Özellikler */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">İsteğe Bağlı Özellikler</h3>
              <p className="text-gray-600 mb-6">
                İhtiyacınıza göre ek özellikler seçebilirsiniz
              </p>
              
              <div className="space-y-4">
                {optionalFeatures.map((feature) => {
                  const Icon = feature.icon;
                  const isSelected = selectedFeatures.includes(feature.id);
                  
                  return (
                    <div
                      key={feature.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 ${
                            isSelected ? 'bg-blue-100' : ''
                          }`}>
                            <Icon className={`w-5 h-5 ${feature.color}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-gray-900 mr-3">
                            {feature.price} TL
                          </span>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedFeatures.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Seçilen Özellikler:</h4>
                  <div className="space-y-1">
                    {selectedFeatures.map(featureId => {
                      const feature = optionalFeatures.find(f => f.id === featureId);
                      return (
                        <div key={featureId} className="flex justify-between text-sm">
                          <span className="text-blue-800">{feature?.name}</span>
                          <span className="text-blue-900 font-medium">{feature?.price} TL</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-semibold">
                    <span className="text-blue-900">Ek Özellikler Toplamı:</span>
                    <span className="text-blue-900">{getSelectedFeaturesTotal()} TL</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ek Bilgiler */}
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Güvenli Ödeme</h3>
              <p className="text-gray-600">SSL şifreli güvenli ödeme sistemi</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Anında Aktivasyon</h3>
              <p className="text-gray-600">Ödeme sonrası anında premium özellikler aktif</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">7/24 Destek</h3>
              <p className="text-gray-600">Premium üyeler için öncelikli destek</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
