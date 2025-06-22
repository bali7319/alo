'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, Crown, Star, Check, Zap, TrendingUp, Eye, Clock } from 'lucide-react';
import { categories, Category } from '@/lib/categories';
import BillingForm from '@/components/BillingForm';

export default function IlanVerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [showPhone, setShowPhone] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedPremiumFeatures, setSelectedPremiumFeatures] = useState<{
    featured: boolean;
    urgent: boolean;
    highlight: boolean;
    top: boolean;
    extended: boolean;
    morePhotos: boolean;
  }>({
    featured: false,
    urgent: false,
    highlight: false,
    top: false,
    extended: false,
    morePhotos: false
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    location: '',
    phone: '',
  });
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    phone: string;
    location: string;
  } | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [billingData, setBillingData] = useState<any>(null);

  // Varsayılan premium planlar (fallback)
  const defaultPremiumPlans = {
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
        'Öncelikli destek',
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
        'Öncelikli destek',
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
        'Öncelikli destek',
        'Reklamsız deneyim',
        '3 ay bedava',
        'Özel destek hattı'
      ]
    }
  };

  // Dinamik premium planlar
  const premiumPlans = settingsLoaded && settings ? {
    none: defaultPremiumPlans.none,
    monthly: {
      ...defaultPremiumPlans.monthly,
      price: settings.premiumPrice || 199,
      duration: `${settings.premiumDuration || 30} gün`,
      features: [
        ...defaultPremiumPlans.monthly.features.slice(0,2),
        `${settings.premiumMaxImages || 5} adet resim yükleme`,
        ...defaultPremiumPlans.monthly.features.slice(3)
      ]
    },
    quarterly: {
      ...defaultPremiumPlans.quarterly,
      price: settings.featuredPrice || 494,
      duration: `${settings.featuredDuration || 90} gün`,
      features: [
        ...defaultPremiumPlans.quarterly.features.slice(0,2),
        `${settings.maxImages || 10} adet resim yükleme`,
        ...defaultPremiumPlans.quarterly.features.slice(3)
      ]
    },
    yearly: {
      ...defaultPremiumPlans.yearly,
      price: settings.topPrice || 2179,
      duration: `${settings.topDuration || 365} gün`,
      features: [
        ...defaultPremiumPlans.yearly.features.slice(0,2),
        'Sınırsız resim yükleme',
        ...defaultPremiumPlans.yearly.features.slice(3)
      ]
    }
  } : defaultPremiumPlans;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris?callbackUrl=/ilan-ver');
    } else if (status === 'authenticated' && !profileLoaded) {
      loadUserProfile();
    }
  }, [status, router, profileLoaded]);

  // Kategori seçildiğinde alt kategorileri sıfırla
  useEffect(() => {
    if (selectedCategory) {
      setSelectedSubCategory(null);
      setFormData(prev => ({ ...prev, subCategory: '' }));
    }
  }, [selectedCategory]);

  // Ücretsiz Gel Al kategorisi seçildiğinde fiyatı otomatik ayarla
  useEffect(() => {
    if (formData.category === 'ucretsiz-gel-al') {
      setFormData(prev => ({ ...prev, price: 'Ücretsiz' }));
    } else if (formData.price === 'Ücretsiz') {
      setFormData(prev => ({ ...prev, price: '' }));
    }
  }, [formData.category]);

  // Profil bilgilerini yükle
  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    } finally {
      setProfileLoaded(true);
    }
  };

  // Ayarları yükle
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
        setSettingsLoaded(true);
      }
    };

    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = selectedPremiumFeatures.top ? 20 : 
                     selectedPremiumFeatures.highlight ? 10 : 
                     selectedPremiumFeatures.urgent ? 5 : 3;
    
    if (images.length + files.length > maxImages) {
      alert(`En fazla ${maxImages} adet resim yükleyebilirsiniz`);
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} bir resim dosyası değil`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} dosyası çok büyük (maksimum 5MB)`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const handleCategoryChange = (categorySlug: string) => {
    const category = categories.find(cat => cat.slug === categorySlug);
    setSelectedCategory(category || null);
    setFormData(prev => ({ ...prev, category: categorySlug, subCategory: '' }));
  };

  const handleSubCategoryChange = (subCategorySlug: string) => {
    const subCategory = selectedCategory?.subcategories?.find(sub => sub.slug === subCategorySlug);
    setSelectedSubCategory(subCategory || null);
    setFormData(prev => ({ ...prev, subCategory: subCategorySlug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Premium plan seçildiğinde fatura bilgileri kontrolü
    if (selectedPremiumFeatures.top && !billingData) {
      alert('Premium plan seçtiğiniz için fatura bilgilerini doldurmanız gerekiyor.');
      return;
    }
    
    const submitButton = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'İşleniyor...';

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.category === 'ucretsiz-gel-al' ? 'Ücretsiz' : formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subCategory', formData.subCategory);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('showPhone', showPhone.toString());
      formDataToSend.append('isPremium', selectedPremiumFeatures.top ? 'true' : 'false');
      formDataToSend.append('premiumFeatures', JSON.stringify(selectedPremiumFeatures));

      images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      if (billingData) {
        Object.entries(billingData).forEach(([key, value]) => {
          formDataToSend.append(`billing_${key}`, value as string);
        });
      }

      const response = await fetch('/api/listings', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        
        if (selectedPremiumFeatures.top) {
          alert('Ödeme başarılı! İlanınız yayınlandı.');
        } else {
          alert('İlanınız başarıyla yayınlandı!');
        }
        
        router.push('/');
      } else {
        const error = await response.json();
        alert(error.message || 'İşlem sırasında bir hata oluştu');
      }
    } catch (error) {
      console.error('İşlem hatası:', error);
      alert('İşlem sırasında bir hata oluştu');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  };

  const calculatePremiumFeaturesTotal = () => {
    let total = 0;
    if (selectedPremiumFeatures.featured) total += settings?.featuredPrice || 50;
    if (selectedPremiumFeatures.urgent) total += settings?.urgentPrice || 30;
    if (selectedPremiumFeatures.highlight) total += settings?.highlightPrice || 40;
    if (selectedPremiumFeatures.top) total += settings?.topPrice || 60;
    if (selectedPremiumFeatures.extended) total += settings?.extendedDurationPrice || 25;
    if (selectedPremiumFeatures.morePhotos) total += settings?.morePhotosPrice || 19;
    return total;
  };

  const getSelectedPremiumFeatures = () => {
    const features: string[] = [];
    if (selectedPremiumFeatures.featured) features.push('Öne Çıkan İlan');
    if (selectedPremiumFeatures.urgent) features.push('Acil İlan');
    if (selectedPremiumFeatures.highlight) features.push('Vurgulanmış İlan');
    if (selectedPremiumFeatures.top) features.push('En Üstte İlan');
    if (selectedPremiumFeatures.extended) features.push('Uzatılmış Süre');
    if (selectedPremiumFeatures.morePhotos) features.push('Ek Fotoğraflar');
    return features;
  };

  const togglePremiumFeature = (feature: 'featured' | 'urgent' | 'highlight' | 'top' | 'extended' | 'morePhotos') => {
    setSelectedPremiumFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Premium Plan Seçimi - Form dışında */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Crown className="w-5 h-5 text-yellow-500 mr-2" />
              Premium Plan Seçimi
            </h2>
          </div>
          
          {/* Premium Planlar */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">Premium Planlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(premiumPlans).map(([key, plan]) => (
                <div
                  key={key}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPremiumFeatures.top
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    e.nativeEvent.preventDefault();
                    togglePremiumFeature('top');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      togglePremiumFeature('top');
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPremiumFeatures.top}
                >
                  {selectedPremiumFeatures.top && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {plan.price === 0 ? 'Ücretsiz' : `${plan.price} ₺`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-gray-500">/ {plan.duration}</span>
                      )}
                    </div>
                    <ul className="mt-3 text-xs text-gray-600 space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-blue-600">+{plan.features.length - 3} özellik daha</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Özellikler */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">Premium Özellikler (İsteğe Bağlı)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Öne Çıkan İlan */}
              <div
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPremiumFeatures.featured
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  e.nativeEvent.preventDefault();
                  togglePremiumFeature('featured');
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && selectedPremiumFeatures.top) {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePremiumFeature('featured');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={selectedPremiumFeatures.featured}
                aria-disabled={!selectedPremiumFeatures.top}
              >
                {selectedPremiumFeatures.featured && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Star className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Öne Çıkan İlan</h3>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-blue-600">
                      {settings?.featuredPrice || 50} ₺
                    </span>
                    <span className="text-sm text-gray-500">/ {settings?.featuredDuration || 15} gün</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    İlanınız kategorisinde öne çıkarılır
                  </p>
                  {!selectedPremiumFeatures.top && (
                    <p className="mt-1 text-xs text-red-500">Premium plan seçin</p>
                  )}
                </div>
              </div>

              {/* Acil İlan */}
              <div
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPremiumFeatures.urgent
                    ? 'border-red-500 bg-red-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  e.nativeEvent.preventDefault();
                  togglePremiumFeature('urgent');
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && selectedPremiumFeatures.top) {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePremiumFeature('urgent');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={selectedPremiumFeatures.urgent}
                aria-disabled={!selectedPremiumFeatures.top}
              >
                {selectedPremiumFeatures.urgent && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Zap className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Acil İlan</h3>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-blue-600">
                      {settings?.urgentPrice || 30} ₺
                    </span>
                    <span className="text-sm text-gray-500">/ {settings?.urgentDuration || 7} gün</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    İlanınız acil rozetiyle öne çıkarılır
                  </p>
                  {!selectedPremiumFeatures.top && (
                    <p className="mt-1 text-xs text-red-500">Premium plan seçin</p>
                  )}
                </div>
              </div>

              {/* Vurgulanmış İlan */}
              <div
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPremiumFeatures.highlight
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  e.nativeEvent.preventDefault();
                  togglePremiumFeature('highlight');
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && selectedPremiumFeatures.top) {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePremiumFeature('highlight');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={selectedPremiumFeatures.highlight}
                aria-disabled={!selectedPremiumFeatures.top}
              >
                {selectedPremiumFeatures.highlight && (
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Vurgulanmış İlan</h3>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-blue-600">
                      {settings?.highlightPrice || 40} ₺
                    </span>
                    <span className="text-sm text-gray-500">/ {settings?.highlightDuration || 10} gün</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    İlanınız renkli çerçeveyle vurgulanır
                  </p>
                  {!selectedPremiumFeatures.top && (
                    <p className="mt-1 text-xs text-red-500">Premium plan seçin</p>
                  )}
                </div>
              </div>

              {/* Uzatılmış Süre */}
              <div
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPremiumFeatures.extended
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => togglePremiumFeature('extended')}
                tabIndex={0}
                role="button"
                aria-pressed={selectedPremiumFeatures.extended}
              >
                {selectedPremiumFeatures.extended && (
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Clock className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Uzatılmış Süre</h3>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-blue-600">
                      {settings?.extendedDurationPrice || 25} ₺
                    </span>
                    <span className="text-sm text-gray-500">/ 30 gün</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    İlanınız 30 gün daha uzatılır
                  </p>
                </div>
              </div>

              {/* Ek Fotoğraflar */}
              <div
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPremiumFeatures.morePhotos
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => togglePremiumFeature('morePhotos')}
                tabIndex={0}
                role="button"
                aria-pressed={selectedPremiumFeatures.morePhotos}
              >
                {selectedPremiumFeatures.morePhotos && (
                  <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Camera className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Ek Fotoğraflar</h3>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-blue-600">
                      {settings?.morePhotosPrice || 19} ₺
                    </span>
                    <span className="text-sm text-gray-500">/ 5 adet</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    5 adet daha fotoğraf ekleme hakkı
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Toplam Ödeme Özeti */}
          {selectedPremiumFeatures.top && (
            <div className="bg-white p-6 rounded-lg border border-blue-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                Ödeme Özeti
              </h3>
              
              <div className="space-y-3">
                {/* Premium Plan */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="font-medium text-gray-700">{premiumPlans.none.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({premiumPlans.none.duration})</span>
                  </div>
                  <span className="font-semibold text-blue-600">{premiumPlans.none.price} ₺</span>
                </div>

                {/* Seçilen Premium Özellikler */}
                {Object.values(selectedPremiumFeatures).some(f => f) && (
                  <>
                    {selectedPremiumFeatures.featured && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="font-medium text-gray-700">Öne Çıkan İlan</span>
                          <span className="text-sm text-gray-500 ml-2">({settings?.featuredDuration || 15} gün)</span>
                        </div>
                        <span className="font-semibold text-blue-600">+{settings?.featuredPrice || 50} ₺</span>
                      </div>
                    )}
                    
                    {selectedPremiumFeatures.urgent && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="font-medium text-gray-700">Acil İlan</span>
                          <span className="text-sm text-gray-500 ml-2">({settings?.urgentDuration || 7} gün)</span>
                        </div>
                        <span className="font-semibold text-blue-600">+{settings?.urgentPrice || 30} ₺</span>
                      </div>
                    )}
                    
                    {selectedPremiumFeatures.highlight && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="font-medium text-gray-700">Vurgulanmış İlan</span>
                          <span className="text-sm text-gray-500 ml-2">({settings?.highlightDuration || 10} gün)</span>
                        </div>
                        <span className="font-semibold text-blue-600">+{settings?.highlightPrice || 40} ₺</span>
                      </div>
                    )}
                    
                    {selectedPremiumFeatures.extended && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="font-medium text-gray-700">Uzatılmış Süre</span>
                          <span className="text-sm text-gray-500 ml-2">(30 gün)</span>
                        </div>
                        <span className="font-semibold text-blue-600">+{settings?.extendedDurationPrice || 25} ₺</span>
                      </div>
                    )}
                    
                    {selectedPremiumFeatures.morePhotos && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="font-medium text-gray-700">Ek Fotoğraflar</span>
                          <span className="text-sm text-gray-500 ml-2">(5 adet)</span>
                        </div>
                        <span className="font-semibold text-blue-600">+{settings?.morePhotosPrice || 19} ₺</span>
                      </div>
                    )}
                  </>
                )}

                {/* Toplam */}
                <div className="flex justify-between items-center py-3 border-t-2 border-blue-200">
                  <span className="text-lg font-bold text-gray-800">Toplam</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {premiumPlans.none.price + calculatePremiumFeaturesTotal()} ₺
                  </span>
                </div>

                {/* Bilgi Notu */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💳 Ödeme işlemi güvenli bir şekilde gerçekleştirilecektir. 
                    İlanınız ödeme sonrası otomatik olarak yayına alınacaktır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fatura Formu */}
          {selectedPremiumFeatures.top && (
            <div className="my-6">
              <BillingForm
                onSubmit={(data) => setBillingData(data)}
                onCancel={() => setBillingData(null)}
                hideButtons={true}
              />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* İlan Bilgileri */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">İlan Bilgileri</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlan Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="İlan başlığınızı girin"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="İlan açıklamanızı detaylı bir şekilde yazın"
                  rows={4}
                  required
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Kategori
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Alt kategori seçin</option>
                    {selectedCategory.subcategories.map((subCategory) => (
                      <option key={subCategory.slug} value={subCategory.slug}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat {formData.category !== 'ucretsiz-gel-al' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formData.category === 'ucretsiz-gel-al' ? 'Ücretsiz' : 'Fiyat girin (örn: 1000)'}
                  required={formData.category !== 'ucretsiz-gel-al'}
                  disabled={formData.category === 'ucretsiz-gel-al'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Konum girin (örn: İstanbul, Kadıköy)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon Numarası <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showPhone"
                      checked={showPhone}
                      onChange={(e) => setShowPhone(e.target.checked)}
                      className="mr-2"
                      required
                    />
                    <label htmlFor="showPhone">Telefon numaramı göster</label>
                  </div>
                  
                  {userProfile && userProfile.phone && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-blue-800 font-medium mb-1">
                            📞 Profil bilgilerinizden telefon
                          </p>
                          <p className="text-xs text-blue-600">
                            {userProfile.phone}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, phone: userProfile.phone }));
                            alert('Telefon numarası dolduruldu!');
                          }}
                          className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Kullan
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 10) {
                        setFormData({ ...formData, phone: value });
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Telefon numaranız (örn: 05551234567)"
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resimler <span className="text-red-500">*</span> 
                  {(() => {
                    const maxImages = selectedPremiumFeatures.top ? 20 : 
                                     selectedPremiumFeatures.highlight ? 10 : 
                                     selectedPremiumFeatures.urgent ? 5 : 3;
                    return ` (En az 1, en fazla ${maxImages} adet)`;
                  })()}
                </label>
                
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-3">
                    📱 Mobil cihazlarda kamera erişimi için aşağıdaki seçenekleri kullanabilirsiniz:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById('camera-input')?.click()}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      📷 Kamera ile Çek
                    </button>
                    <button
                      type="button"
                      onClick={() => document.getElementById('gallery-input')?.click()}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      🖼️ Galeriden Seç
                    </button>
                  </div>
                </div>

                <input
                  id="camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  id="gallery-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`İlan resmi ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(() => {
                    const maxImages = selectedPremiumFeatures.top ? 20 : 
                                     selectedPremiumFeatures.highlight ? 10 : 
                                     selectedPremiumFeatures.urgent ? 5 : 3;
                    return images.length < maxImages;
                  })() && (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        capture="environment"
                      />
                      <Camera className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2">Resim Ekle</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={
                  !formData.title.trim() || 
                  !formData.description.trim() || 
                  !formData.category || 
                  !formData.location.trim() || 
                  !formData.phone.trim() || 
                  images.length === 0 || 
                  (selectedPremiumFeatures.top && formData.category !== 'ucretsiz-gel-al' && !formData.price.trim()) ||
                  (selectedPremiumFeatures.top && !billingData)
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {selectedPremiumFeatures.top 
                  ? `Ödeme Yap ve İlanı Yayınla (${premiumPlans.none.price + calculatePremiumFeaturesTotal()} ₺)`
                  : 'İlanı Yayınla'
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 
