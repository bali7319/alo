'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Crown, Star, Check, Zap, TrendingUp, Eye, Clock, Plus, X, Sparkles } from 'lucide-react';
import { categories, Category } from '@/lib/categories';

export default function IlanVerPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [showPhone, setShowPhone] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptionalFeatures, setShowOptionalFeatures] = useState(false);
  const [optionalFeatures, setOptionalFeatures] = useState<Array<{key: string, value: string}>>([]);
  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [newFeatureValue, setNewFeatureValue] = useState('');
  const [adminSettings, setAdminSettings] = useState({
    featuredPrice: 50,
    urgentPrice: 30,
    highlightPrice: 25,
    topPrice: 75
  });
  const [premiumSettings, setPremiumSettings] = useState({
    featured: false,
    urgent: false,
    highlight: false,
    topPosition: false
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    location: '',
    phone: '',
    termsAccepted: false,
  });

  // Varsayılan premium planlar
  const premiumPlans = {
    none: {
      name: 'Ücretsiz',
      price: 0,
      duration: '30 gün',
      features: [
        'Temel ilan özellikleri',
        '3 adet resim yükleme',
        'Standart görünüm'
      ]
    },
    monthly: {
      name: 'Aylık Premium',
      price: 199,
      duration: '30 gün',
      features: [
        'İlan öne çıkarma',
        'Premium rozeti',
        '5 adet resim yükleme',
        'Reklamsız deneyim'
      ]
    },
    quarterly: {
      name: '3 Aylık Premium',
      price: 494,
      duration: '90 gün',
      features: [
        'İlan öne çıkarma',
        'Premium rozeti',
        '10 adet resim yükleme',
        'Reklamsız deneyim',
        '1 ay bedava'
      ]
    },
    yearly: {
      name: 'Yıllık Premium',
      price: 2179,
      duration: '365 gün',
      features: [
        'İlan öne çıkarma',
        'Premium rozeti',
        'Sınırsız resim yükleme',
        'Reklamsız deneyim',
        '3 ay bedava',
        'Özel destek hattı'
      ]
    }
  };

  // Premium özellik seçenekleri - Admin ayarlarından dinamik olarak
  const premiumFeatures = [
    {
      id: 'featured',
      name: 'Öne Çıkan İlan',
      description: 'İlanınız ana sayfada öne çıkarılır',
      price: adminSettings.featuredPrice,
      icon: Star
    },
    {
      id: 'urgent',
      name: 'Acil Satılık',
      description: 'Acil satılık rozeti ile dikkat çekin',
      price: adminSettings.urgentPrice,
      icon: Zap
    },
    {
      id: 'highlight',
      name: 'Renkli Vurgu',
      description: 'İlanınız renkli çerçeve ile vurgulanır',
      price: adminSettings.highlightPrice,
      icon: Sparkles
    },
    {
      id: 'topPosition',
      name: 'Üst Sıralama',
      description: 'Kategori sayfalarında üst sıralarda yer alın',
      price: adminSettings.topPrice,
      icon: TrendingUp
    }
  ];

  // Önceden tanımlanmış özellik seçenekleri
  const predefinedFeatures = [
    'Marka', 'Model', 'Renk', 'Boyut', 'Ağırlık', 'Malzeme', 'Garanti', 'Kullanım Süresi',
    'Durum', 'Paket İçeriği', 'Teknik Özellikler', 'Enerji Sınıfı', 'Güç', 'Kapasite',
    'Ölçüler', 'Stok Durumu', 'Teslimat', 'Ödeme Seçenekleri', 'İade Koşulları',
    'Yıl', 'Kilometre', 'Yakıt Tipi', 'Vites', 'Motor Hacmi', 'Çekim', 'Kasa Tipi',
    'Renk', 'Donanım', 'Servis Geçmişi', 'Sigorta', 'Muayene', 'Ruhsat', 'Fatura',
    'Kullanım Durumu', 'Ekspertiz', 'Takas', 'Kredi', 'Nakit', 'Pazarlık Payı'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages].slice(0, 10));
    }
  };

  const handleCategoryChange = (categorySlug: string) => {
    const category = categories.find(cat => cat.slug === categorySlug);
    setSelectedCategory(category || null);
    setSelectedSubCategory(null);
    setFormData(prev => ({ ...prev, category: categorySlug, subCategory: '' }));
  };

  const handleSubCategoryChange = (subCategorySlug: string) => {
    const subCategory = selectedCategory?.subcategories?.find(sub => sub.slug === subCategorySlug);
    setSelectedSubCategory(subCategory || null);
    setFormData(prev => ({ ...prev, subCategory: subCategorySlug }));
  };

  const addOptionalFeature = () => {
    if (newFeatureKey.trim() && newFeatureValue.trim()) {
      setOptionalFeatures(prev => [...prev, { key: newFeatureKey.trim(), value: newFeatureValue.trim() }]);
      setNewFeatureKey('');
      setNewFeatureValue('');
    }
  };

  const removeOptionalFeature = (index: number) => {
    setOptionalFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handlePremiumSettingChange = (settingId: string) => {
    setPremiumSettings(prev => ({
      ...prev,
      [settingId]: !prev[settingId as keyof typeof prev]
    }));
  };

  const calculateTotalPrice = () => {
    const planPrice = premiumPlans[selectedPlan as keyof typeof premiumPlans].price;
    const premiumFeaturesPrice = Object.entries(premiumSettings)
      .filter(([_, enabled]) => enabled)
      .reduce((total, [settingId]) => {
        const feature = premiumFeatures.find(f => f.id === settingId);
        return total + (feature?.price || 0);
      }, 0);
    return planPrice + premiumFeaturesPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Form validasyonu
      if (!formData.title || !formData.description || !formData.price || !formData.category || !formData.location || !formData.phone) {
        alert('Lütfen tüm zorunlu alanları doldurun.');
        return;
      }

      if (!formData.termsAccepted) {
        alert('Kullanım koşullarını kabul etmelisiniz.');
        return;
      }

      // Seçilen plan bilgisi
      const selectedPlanData = premiumPlans[selectedPlan as keyof typeof premiumPlans];
      
      // İlan verilerini hazırla
      const listingData = {
        id: Date.now(), // Benzersiz ID
        ...formData,
        plan: selectedPlan,
        planName: selectedPlanData.name,
        planPrice: selectedPlanData.price,
        premiumSettings: premiumSettings,
        premiumFeaturesPrice: Object.entries(premiumSettings)
          .filter(([_, enabled]) => enabled)
          .reduce((total, [settingId]) => {
            const feature = premiumFeatures.find(f => f.id === settingId);
            return total + (feature?.price || 0);
          }, 0),
        totalPrice: calculateTotalPrice(),
        images: images.length,
        optionalFeatures: optionalFeatures,
        createdAt: new Date().toISOString(),
        isPremium: selectedPlan !== 'none',
        // Demo için varsayılan değerler
        views: 0,
        likes: 0,
        status: 'active'
      };

      // Mevcut ilanları localStorage'dan al
      const existingListings = JSON.parse(localStorage.getItem('userListings') || '[]');
      
      // Yeni ilanı ekle
      const updatedListings = [listingData, ...existingListings];
      
      // localStorage'a kaydet
      localStorage.setItem('userListings', JSON.stringify(updatedListings));

      // Demo için başarı mesajı
      const successMessage = selectedPlan === 'none' 
        ? 'İlanınız başarıyla yayınlandı! Ücretsiz plan ile 30 gün boyunca yayında kalacak.'
        : `İlanınız başarıyla yayınlandı! ${selectedPlanData.name} planı ile ${selectedPlanData.duration} boyunca premium özelliklerle yayında kalacak.`;

      alert(successMessage);
      
      // Form'u temizle
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        subCategory: '',
        location: '',
        phone: '',
        termsAccepted: false,
      });
      setImages([]);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setSelectedPlan('none');
      setOptionalFeatures([]);
      setShowOptionalFeatures(false);
      setPremiumSettings({
        featured: false,
        urgent: false,
        highlight: false,
        topPosition: false
      });

      // Ana sayfaya yönlendir
      router.push('/');

    } catch (error) {
      alert('İlan yayınlanırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin ayarlarını yükle
  const fetchAdminSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const settings = await response.json();
      setAdminSettings({
        featuredPrice: settings.featuredPrice || 50,
        urgentPrice: settings.urgentPrice || 30,
        highlightPrice: settings.highlightPrice || 25,
        topPrice: settings.topPrice || 75
      });
    } catch (error) {
      console.error('Admin ayarları yüklenirken hata:', error);
      // Hata durumunda varsayılan değerleri kullan
      setAdminSettings({
        featuredPrice: 50,
        urgentPrice: 30,
        highlightPrice: 25,
        topPrice: 75
      });
    }
  };

  useEffect(() => {
    fetchAdminSettings();
    
    // Her 30 saniyede bir admin ayarlarını kontrol et
    const interval = setInterval(fetchAdminSettings, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">İlan Ver</h1>
            <p className="text-gray-600">Ürününüzü veya hizmetinizi satışa çıkarın</p>
          </div>

          {/* Premium Plans */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Crown className="w-5 h-5 text-yellow-500 mr-2" />
              Premium Plan Seçin
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(premiumPlans).map(([key, plan]) => (
                <div 
                  key={key} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan === key 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'hover:shadow-md hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    {selectedPlan === key && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">{plan.duration}</div>
                  <ul className="space-y-1 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Premium İlan Ayarları */}
          {selectedPlan !== 'none' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                Premium İlan Ayarları
              </h2>
              <p className="text-gray-600 mb-4">
                İlanınızı daha etkili hale getirmek için ek özellikler seçebilirsiniz.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {premiumFeatures.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <div 
                      key={feature.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        premiumSettings[feature.id as keyof typeof premiumSettings]
                          ? 'border-purple-500 bg-purple-50 shadow-md' 
                          : 'hover:shadow-md hover:border-gray-300'
                      }`}
                      onClick={() => handlePremiumSettingChange(feature.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <IconComponent className="w-5 h-5 text-purple-500 mr-2" />
                          <h3 className="font-semibold text-sm">{feature.name}</h3>
                        </div>
                        {premiumSettings[feature.id as keyof typeof premiumSettings] && (
                          <Check className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
                      <div className="text-sm font-bold text-purple-600">₺{feature.price}</div>
                    </div>
                  );
                })}
              </div>

              {/* Toplam Fiyat */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Toplam Premium Ücret:</span>
                  <span className="text-2xl font-bold text-purple-600">₺{calculateTotalPrice()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Plan ücreti + seçilen özellikler
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">İlan Bilgileri</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlan Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="İlan başlığınızı girin"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              {selectedCategory?.subcategories && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Kategori
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Alt kategori seçin</option>
                    {selectedCategory.subcategories.map((sub) => (
                      <option key={sub.slug} value={sub.slug}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ürün veya hizmetiniz hakkında detaylı bilgi verin"
                />
              </div>

              {/* Price */}
              {formData.category !== 'ucretsiz-gel-al' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (TL) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Fiyat girin"
                  />
                </div>
              )}
              
              {formData.category === 'ucretsiz-gel-al' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (TL)
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
                    Ücretsiz Gel Al kategorisi seçili - fiyat alanı gizli
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ücretsiz Gel Al kategorisinde fiyat belirtmenize gerek yoktur.
                  </p>
                </div>
              )}

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Şehir, ilçe"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              {/* Optional Features */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">İsteğe Bağlı Özellikler</h3>
                  <button
                    type="button"
                    onClick={() => setShowOptionalFeatures(!showOptionalFeatures)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    {showOptionalFeatures ? (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Gizle
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Özellik Ekle
                      </>
                    )}
                  </button>
                </div>

                {showOptionalFeatures && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Ürününüzün ek özelliklerini belirtmek için özellik ekleyebilirsiniz. (Örn: Marka, Model, Renk, Boyut vb.)
                    </p>

                    {/* Add New Feature */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Özellik Adı
                        </label>
                        <select
                          value={newFeatureKey}
                          onChange={(e) => setNewFeatureKey(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Özellik seçin</option>
                          {predefinedFeatures.map((feature) => (
                            <option key={feature} value={feature}>
                              {feature}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Değer
                        </label>
                        <input
                          type="text"
                          value={newFeatureValue}
                          onChange={(e) => setNewFeatureValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Özellik değeri"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={addOptionalFeature}
                          disabled={!newFeatureKey || !newFeatureValue}
                          className={`w-full px-4 py-2 rounded-md transition-colors ${
                            newFeatureKey && newFeatureValue
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Ekle
                        </button>
                      </div>
                    </div>

                    {/* Custom Feature Input */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Özel Özellik
                        </label>
                        <input
                          type="text"
                          value={newFeatureKey}
                          onChange={(e) => setNewFeatureKey(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Özel özellik adı"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Değer
                        </label>
                        <input
                          type="text"
                          value={newFeatureValue}
                          onChange={(e) => setNewFeatureValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Özellik değeri"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={addOptionalFeature}
                          disabled={!newFeatureKey || !newFeatureValue}
                          className={`w-full px-4 py-2 rounded-md transition-colors ${
                            newFeatureKey && newFeatureValue
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Ekle
                        </button>
                      </div>
                    </div>

                    {/* Display Added Features */}
                    {optionalFeatures.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Eklenen Özellikler:</h4>
                        <div className="space-y-2">
                          {optionalFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                              <div>
                                <span className="font-medium text-gray-900">{feature.key}:</span>
                                <span className="ml-2 text-gray-700">{feature.value}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeOptionalFeature(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resimler
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Resim yüklemek için tıklayın</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
                  >
                    Resim Seç
                  </label>
                </div>
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="border-t pt-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      <a 
                        href="/kullanim-kosullari" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        Kullanım Koşulları
                      </a>{' '}
                      ve{' '}
                      <a 
                        href="/gizlilik-politikasi" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        Gizlilik Politikası
                      </a>'nı okudum ve kabul ediyorum. *
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      İlanınızı yayınlayarak, platform kurallarına uygun olduğunu ve doğru bilgiler verdiğinizi onaylıyorsunuz.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!formData.termsAccepted || isSubmitting}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    formData.termsAccepted && !isSubmitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 