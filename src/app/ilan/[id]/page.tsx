import { Heart, Phone, Mail, Share2, Facebook, Twitter, Instagram, MessageCircle, ChevronRight, Eye, MessageSquare, AlertTriangle, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Hw7Zyc2VsIFlvayA8L3RleHQ+PC9zdmc+';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  category: string;
  subcategory: string;
  isPremium: boolean;
  premiumUntil: Date | null;
  features: string[];
  images: string[];
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt: Date;
  views: number;
  condition: string;
  brand: string;
  model: string;
  year: number;
  approvalStatus: string;
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
export default async function IlanDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: listingId } = await params;
  
  // Server-side data fetching
  let listing: Listing | null = null;
  let error: string | null = null;
  
  try {
    // Gerçek uygulamada burada API çağrısı yapılacak
    // Şimdilik mock data kullanıyoruz
    listing = {
      id: listingId,
      title: 'iPhone 14 Pro Max 256GB',
      price: 45000,
      location: 'İstanbul',
      description: 'Apple iPhone 14 Pro Max 256GB, Uzay Siyahı, 1 yıl garantili, kutulu ve faturası mevcut.',
      category: 'elektronik',
      subcategory: 'telefon',
      isPremium: true,
      premiumUntil: new Date('2024-12-31'),
      features: ['5G', 'Face ID', 'ProRAW'],
      images: ['https://picsum.photos/seed/iphone14/500/300'],
      seller: {
        id: '1',
        name: 'Apple Türkiye',
        email: 'info@appleturkiye.com',
        phone: '+90 212 123 45 67'
      },
      createdAt: new Date('2024-01-15'),
      views: 1250,
      condition: 'Yeni',
      brand: 'Apple',
      model: 'iPhone 14 Pro Max',
      year: 2024,
      approvalStatus: 'approved'
    };
  } catch (err) {
    error = err instanceof Error ? err.message : 'Bir hata oluştu';
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">İlan bulunamadı</h1>
          <p className="text-gray-600 mb-4">{error || 'Aradığınız ilan mevcut değil.'}</p>
          <Link 
            href="/" 
            className="inline-block bg-alo-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // İlan onaylanmamışsa gösterme
  if (listing.approvalStatus !== 'approved') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">İlan henüz onaylanmamış</h1>
          <p className="text-gray-600 mb-4">Bu ilan henüz moderatör tarafından onaylanmamıştır.</p>
          <Link 
            href="/" 
            className="inline-block bg-alo-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // İlan detayında images'ı parse et
  const images = Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images || "[]");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-alo-orange">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href={`/kategori/${listing.category.toLowerCase()}`} className="text-gray-700 hover:text-alo-orange">
                {listing.category}
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{listing.title}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* İlan Detayları */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon - Resimler ve Detaylar */}
        <div className="lg:col-span-2">
          {/* Resim Galerisi */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="relative h-[400px]">
              {images.length > 0 ? (
                <Image
                  src={images[0]}
                  alt={`${listing.title} - Ana Resim`}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-500">Resim bulunamadı</span>
                </div>
              )}
            </div>
            
            {/* Küçük Resimler */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 p-4">
                {images.slice(0, 5).map((image: string, index: number) => (
                  <div key={index} className="relative h-20">
                    <Image
                      src={image}
                      alt={`${listing.title} - Resim ${index + 1}`}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* İlan Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>
            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-bold text-alo-orange">
                {listing.price.toLocaleString('tr-TR')} TL
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {listing.views} görüntülenme
                </span>
                <button className="text-gray-500 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Durum</span>
                <p className="font-semibold">{listing.condition}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Marka</span>
                <p className="font-semibold">{listing.brand}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Model</span>
                <p className="font-semibold">{listing.model}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Yıl</span>
                <p className="font-semibold">{listing.year}</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-3">Açıklama</h3>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>

            {listing.features && listing.features.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Özellikler</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {listing.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-alo-orange rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sağ Kolon - Satıcı Bilgileri */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{listing.seller.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    4.8
                  </span>
                  <span className="mx-2">•</span>
                  <span>Üye 2023</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Konum:</span>
                <span className="font-medium">{listing.location}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Üyelik:</span>
                <span className="font-medium">2023</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button className="w-full bg-alo-orange text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center">
                <Phone className="w-4 h-4 mr-2" />
                Telefonu Göster
              </button>
              
              <button className="w-full bg-white border border-alo-orange text-alo-orange py-3 px-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center">
                <Mail className="w-4 h-4 mr-2" />
                Mesaj Gönder
              </button>
              
              <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center">
                <Share2 className="w-4 h-4 mr-2" />
                Paylaş
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>İlan Tarihi:</span>
                <span>{listing.createdAt.toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                <span>İlan No:</span>
                <span>{listing.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 