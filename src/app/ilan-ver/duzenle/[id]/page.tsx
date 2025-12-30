'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, X } from 'lucide-react';
import { categories, Category } from '@/lib/categories';

interface ListingData {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  subSubCategory?: string;
  location: string;
  phone: string;
  condition: string;
  brand?: string;
  images: string[];
  features: string[];
  isPremium: boolean;
  showPhone: boolean;
}

export default function IlanDuzenlePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    subSubCategory: '',
    location: '',
    phone: '',
    condition: '',
    brand: '',
    showPhone: true,
    features: [] as string[],
  });

  // Giriş kontrolü
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(`/giris?callbackUrl=${encodeURIComponent(`/ilan-ver/duzenle/${listingId}`)}`);
    }
  }, [session, status, router, listingId]);

  // İlan verilerini yükle
  useEffect(() => {
    if (!listingId || status === 'loading') return;

    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`);
        if (!response.ok) {
          throw new Error('İlan bulunamadı');
        }

        const data = await response.json();
        const listingData = data.listing;

        if (!listingData) {
          throw new Error('İlan bulunamadı');
        }

        // Kullanıcı kontrolü - sadece ilan sahibi veya admin düzenleyebilir
        const { getAdminEmail } = await import('@/lib/admin');
        const adminEmail = getAdminEmail();
        const isAdmin = session?.user?.email === adminEmail;
        const isOwner = session?.user?.email === listingData.user?.email;
        
        if (!isAdmin && !isOwner) {
          throw new Error('Bu ilanı düzenleme yetkiniz yok');
        }

        // İlan verilerini parse et
        const parseArray = (val: string | string[] | null): string[] => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          try {
            if (typeof val === 'string' && val.startsWith('data:image')) {
              return [val];
            }
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return typeof val === 'string' ? [val] : [];
          }
        };

        const imagesArray = parseArray(listingData.images);
        const featuresArray = parseArray(listingData.features);

        setExistingImages(imagesArray);
        setFormData({
          title: listingData.title || '',
          description: listingData.description || '',
          price: listingData.price?.toString() || '',
          category: listingData.category || '',
          subCategory: listingData.subCategory || '',
          subSubCategory: listingData.subSubCategory || '',
          location: listingData.location || '',
          phone: listingData.phone || listingData.user?.phone || '',
          condition: listingData.condition || '',
          brand: listingData.brand || '',
          showPhone: listingData.showPhone !== false,
          features: featuresArray,
        });

        // Kategori seçimini ayarla
        const category = categories.find(c => c.slug === listingData.category);
        if (category) {
          setSelectedCategory(category);
          const subCategory = category.subcategories?.find(s => s.slug === listingData.subCategory);
          if (subCategory) {
            setSelectedSubCategory(subCategory);
          }
        }

        setListing(listingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'İlan yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchListing();
    }
  }, [listingId, session, status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Kategori değiştiğinde alt kategorileri güncelle
    if (name === 'category') {
      const category = categories.find(c => c.slug === value);
      setSelectedCategory(category || null);
      setSelectedSubCategory(null);
      setFormData(prev => ({ ...prev, subCategory: '', subSubCategory: '' }));
    }

    // Alt kategori değiştiğinde
    if (name === 'subCategory' && selectedCategory) {
      const subCategory = selectedCategory.subcategories?.find(s => s.slug === value);
      setSelectedSubCategory(subCategory || null);
      setFormData(prev => ({ ...prev, subSubCategory: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles].slice(0, 10)); // Max 10 resim
    }
  };

  const removeImage = (index: number) => {
    // Son resim silinemez kontrolü
    const currentTotal = existingImages.length + images.length;
    if (currentTotal <= 1) {
      alert('En az bir resim bulunmalıdır. Resim olmadan ilan yayınlanamaz.');
      return;
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    // Son resim silinemez kontrolü
    const currentTotal = existingImages.length + images.length;
    if (currentTotal <= 1) {
      alert('En az bir resim bulunmalıdır. Resim olmadan ilan yayınlanamaz.');
      return;
    }
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push(`/giris?callbackUrl=${encodeURIComponent(`/ilan-ver/duzenle/${listingId}`)}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Resimleri base64'e çevir (optimize edilmiş - boyut küçültülür)
      let newImageData: string[] = [];
      try {
        const { compressImagesToBase64 } = await import('@/lib/image-utils');
        // Resimleri optimize et: max 1920x1080, kalite 0.8
        newImageData = await compressImagesToBase64(images, 1920, 1080, 0.8);
      } catch (error) {
        console.error('Resim optimizasyon hatası:', error);
        // Fallback: Eğer optimizasyon başarısız olursa, orijinal boyutta yükle
        const imagePromises = images.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });
        newImageData = await Promise.all(imagePromises);
      }
      const allImages = [...existingImages, ...newImageData];

      // Resim zorunlu kontrolü
      if (!allImages || allImages.length === 0) {
        alert('En az bir resim yüklemelisiniz. Resim olmadan ilan yayınlanamaz.');
        setIsSubmitting(false);
        return;
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        subCategory: formData.subCategory || null,
        subSubCategory: formData.subSubCategory || null,
        location: formData.location,
        phone: formData.phone,
        condition: formData.condition || null,
        brand: formData.brand || null,
        images: JSON.stringify(allImages),
        features: JSON.stringify(formData.features),
        showPhone: formData.showPhone,
      };

      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Güncelleme başarısız' }));
        throw new Error(errorData.error || 'İlan güncellenirken bir hata oluştu');
      }

      alert('İlan başarıyla güncellendi!');
      router.push(`/ilan/${listingId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'İlan güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alo-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
          <p className="text-gray-600 mb-4">{error || 'İlan bulunamadı'}</p>
          <button
            onClick={() => router.push('/ilanlarim')}
            className="inline-block bg-alo-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
          >
            İlanlarıma Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">İlan Düzenle</h1>
            <p className="text-gray-600 mt-2">İlanınızı güncelleyin</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* Başlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İlan Başlığı *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
              />
            </div>

            {/* Fiyat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (TL) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
              />
            </div>

            {/* Kategori ve Alt Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Kategori</label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                >
                  <option value="">Alt kategori seçin</option>
                  {selectedCategory?.subcategories?.map((sub) => (
                    <option key={sub.slug} value={sub.slug}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Konum ve Telefon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konum *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                />
              </div>
            </div>

            {/* Durum, Marka */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                >
                  <option value="">Durum seçin</option>
                  <option value="Yeni">Yeni</option>
                  <option value="İkinci El">İkinci El</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marka</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                />
              </div>
            </div>

            {/* Mevcut Resimler */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Resimler</label>
                <div className="grid grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Resim ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yeni Resim Ekleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Resimler Ekle</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
              />
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Yeni resim ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Telefon Görünürlüğü */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.showPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, showPhone: e.target.checked }))}
                  className="rounded border-gray-300 text-alo-orange focus:ring-alo-orange"
                />
                <span className="text-sm text-gray-700">Telefon numaramı göster</span>
              </label>
            </div>

            {/* Butonlar */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/ilanlarim')}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-alo-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Güncelleniyor...' : 'İlanı Güncelle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
