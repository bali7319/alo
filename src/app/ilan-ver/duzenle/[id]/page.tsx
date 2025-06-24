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

// generateStaticParams fonksiyonu ekle
export async function generateStaticParams() {
  // Örnek olarak ilk 10 ilanı statik olarak oluştur
  const listings = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
    { id: '10' }
  ];
  
  return listings.map((listing) => ({
    id: listing.id,
  }));
}

// Server-side component'e çevir
export default async function IlanDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: listingId } = await params;
  
  // Server-side data fetching
  let listing: ListingData | null = null;
  let error: string | null = null;
  
  try {
    // Mock veri - gerçek uygulamada API'den gelecek
    listing = {
      id: listingId,
      title: 'iPhone 14 Pro Max 256GB',
      description: 'Apple iPhone 14 Pro Max 256GB, Uzay Siyahı, 1 yıl garantili, kutulu ve faturası mevcut.',
      price: 45000,
      category: 'elektronik',
      subCategory: 'telefon',
      location: 'İstanbul',
      phone: '+90 212 123 45 67',
      condition: 'Yeni',
      brand: 'Apple',
      model: 'iPhone 14 Pro Max',
      year: '2024',
      images: ['https://picsum.photos/seed/iphone14/500/300'],
      features: ['5G', 'Face ID', 'ProRAW'],
      isPremium: false,
      showPhone: true
    };
  } catch (err) {
    error = err instanceof Error ? err.message : 'Bir hata oluştu';
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">İlan bulunamadı</h1>
          <p className="text-gray-600 mb-4">{error || 'Aradığınız ilan mevcut değil.'}</p>
          <a 
            href="/" 
            className="inline-block bg-alo-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
          >
            Ana Sayfaya Dön
          </a>
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
            <p className="text-gray-600 mt-2">İlanınızı güncelleyin ve yayınlayın</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">İlan Bilgileri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İlan Başlığı</label>
                  <input
                    type="text"
                    defaultValue={listing.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                    placeholder="İlan başlığını girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (TL)</label>
                  <input
                    type="number"
                    defaultValue={listing.price}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <textarea
                defaultValue={listing.description}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                placeholder="İlanınızı detaylı olarak açıklayın..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  defaultValue={listing.category}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                >
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
                  defaultValue={listing.subCategory}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                >
                  <option value="">Alt kategori seçin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <select
                  defaultValue={listing.condition}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
                >
                  <option value="Yeni">Yeni</option>
                  <option value="Az Kullanılmış">Az Kullanılmış</option>
                  <option value="İyi">İyi</option>
                  <option value="Orta">Orta</option>
                  <option value="Kötü">Kötü</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                İptal
              </button>
              <button className="bg-alo-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">
                İlanı Güncelle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 