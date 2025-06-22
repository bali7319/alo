'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, Crown, Star, Check, Zap, TrendingUp, Eye } from 'lucide-react';
import { categories, Category } from '@/lib/categories';
import BillingForm from '@/components/BillingForm';

interface ListingData {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  location: string;
  phone: string;
  condition: string;
  brand?: string;
  model?: string;
  year?: string;
  images: string[];
  features: string[];
  isPremium: boolean;
  premiumPlan?: string;
  premiumFeatures?: any;
  showPhone: boolean;
}

export default function IlanDuzenlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const listingId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [showPhone, setShowPhone] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedPremiumFeatures, setSelectedPremiumFeatures] = useState({
    featured: false,
    urgent: false,
    highlight: false,
    top: false,
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
    condition: '',
    brand: '',
    model: '',
    year: '',
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // İlan verilerini yükle
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/giris');
      return;
    }
    if (!listingId) {
      setError('İlan ID bulunamadı.');
      setLoading(false);
      return;
    }
    loadListingData();
  }, [session, status, router, listingId]);

  const loadListingData = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) {
        throw new Error('İlan bulunamadı');
      }

      const listing: ListingData = await response.json();
      
      // Form verilerini doldur
      setFormData({
        title: listing.title,
        description: listing.description,
        price: listing.price.toString(),
        category: listing.category,
        subCategory: listing.subCategory,
        location: listing.location,
        phone: listing.phone,
        condition: listing.condition,
        brand: listing.brand || '',
        model: listing.model || '',
        year: listing.year || '',
      });

      setExistingImages(listing.images);
      setShowPhone(listing.showPhone);
      setSelectedPremiumFeatures(listing.premiumFeatures || {
        featured: false,
        urgent: false,
        highlight: false,
        top: false,
      });

      // Kategori seçimini ayarla
      const category = categories.find(c => c.slug === listing.category);
      setSelectedCategory(category || null);
      
      if (category && listing.subCategory) {
        const subCategory = category.subcategories?.find(s => s.slug === listing.subCategory);
        setSelectedSubCategory(subCategory || null);
      }

    } catch (error) {
      console.error('İlan yükleme hatası:', error);
      setError('İlan yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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
      }
    };

    fetchSettings();
    loadUserProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitButton = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Güncelleniyor...';

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
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('isPremium', 'false');
      formDataToSend.append('premiumFeatures', JSON.stringify(selectedPremiumFeatures));

      // Mevcut resimleri ekle
      existingImages.forEach((image, index) => {
        formDataToSend.append('existingImages', image);
      });

      // Yeni resimleri ekle
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        alert('İlan başarıyla güncellendi!');
        router.push('/ilanlarim');
      } else {
        const errorData = await response.json();
        alert(`İlan güncellenirken hata: ${errorData.message || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('İlan güncelleme hatası:', error);
      alert('İlan güncellenirken bir hata oluştu');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-medium">Hata</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={() => router.push('/ilanlarim')}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              İlanlarım'a Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">İlan Düzenle</h1>
          <p className="text-gray-600">
            İlanınızı güncelleyin ve yayınlayın.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Temel Bilgiler</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlan Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="İlan başlığını girin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Fiyat girin"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="İlan açıklamasını girin"
                required
              />
            </div>
          </div>

          {/* Kategori Seçimi */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Kategori</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ana Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value, subCategory: '' });
                    setSelectedCategory(categories.find(c => c.slug === e.target.value) || null);
                    setSelectedSubCategory(null);
                  }}
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

              {selectedCategory && selectedCategory.subcategories && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Kategori
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => {
                      setFormData({ ...formData, subCategory: e.target.value });
                      setSelectedSubCategory(selectedCategory.subcategories?.find(s => s.slug === e.target.value) || null);
                    }}
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
            </div>
          </div>

          {/* Konum ve İletişim */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Konum ve İletişim</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Telefon numarası"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={(e) => setShowPhone(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Telefon numaramı ilanda göster
                </span>
              </label>
            </div>
          </div>

          {/* Resimler */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Resimler</h2>
            
            {/* Mevcut Resimler */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Mevcut Resimler</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Resim ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yeni Resimler */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Resimler Ekle
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Yüklenen Resimler */}
            {images.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Yeni Yüklenen Resimler</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Yeni resim ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Premium Plan Seçimi */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                Premium Plan Seçimi
              </h2>
            </div>

            {/* Premium Planlar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { id: 'none', name: 'Ücretsiz', price: '0₺', duration: '30 gün' },
                { id: 'monthly', name: 'Aylık', price: '29₺', duration: '30 gün' },
                { id: 'quarterly', name: '3 Aylık', price: '79₺', duration: '90 gün' },
                { id: 'yearly', name: 'Yıllık', price: '299₺', duration: '365 gün' },
              ].map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    'false' === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-2xl font-bold text-blue-600">{plan.price}</p>
                    <p className="text-sm text-gray-500">{plan.duration}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Premium Özellikler */}
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-3">Premium Özellikler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'featured', name: 'Öne Çıkan', icon: Star, description: 'Ana sayfada öne çıkar' },
                  { key: 'urgent', name: 'Acil', icon: Zap, description: 'Acil ilan olarak işaretle' },
                  { key: 'highlight', name: 'Vurgulu', icon: TrendingUp, description: 'Renkli arka plan' },
                  { key: 'top', name: 'En Üstte', icon: Eye, description: 'Kategoride en üstte göster' },
                ].map((feature) => (
                  <div
                    key={feature.key}
                    onClick={() => setSelectedPremiumFeatures(prev => ({
                      ...prev,
                      [feature.key]: !prev[feature.key as keyof typeof prev]
                    }))}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPremiumFeatures[feature.key as keyof typeof selectedPremiumFeatures]
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <feature.icon className="w-5 h-5 mr-2 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{feature.name}</h4>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                      {selectedPremiumFeatures[feature.key as keyof typeof selectedPremiumFeatures] && (
                        <Check className="w-5 h-5 ml-auto text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fatura Formu */}
            <div className="my-6">
              <BillingForm
                onSubmit={() => {}}
                onCancel={() => {}}
              />
            </div>
          </div>

          {/* Gönder Butonu */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/ilanlarim')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              İlanı Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 