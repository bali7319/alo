import { ArrowLeft, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ReportReason {
  id: string;
  label: string;
  description: string;
}

const reportReasons: ReportReason[] = [
  {
    id: 'fake',
    label: 'Sahte İlan',
    description: 'İlan gerçek değil veya yanıltıcı bilgiler içeriyor'
  },
  {
    id: 'spam',
    label: 'Spam',
    description: 'İstenmeyen veya tekrarlayan içerik'
  },
  {
    id: 'inappropriate',
    label: 'Uygunsuz İçerik',
    description: 'Uygunsuz, zararlı veya yasa dışı içerik'
  },
  {
    id: 'scam',
    label: 'Dolandırıcılık',
    description: 'Dolandırıcılık girişimi veya şüpheli aktivite'
  },
  {
    id: 'copyright',
    label: 'Telif Hakkı İhlali',
    description: 'Telif hakkı korumalı içerik kullanımı'
  },
  {
    id: 'other',
    label: 'Diğer',
    description: 'Yukarıdaki kategorilerde olmayan sorun'
  }
];

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
export default async function IlanSikayetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: listingId } = await params;
  
  // Server-side data fetching
  let listing: any = null;
  
  try {
    // Mock veri - gerçek uygulamada API'den gelecek
    listing = {
      id: listingId,
      title: 'iPhone 14 Pro Max',
      price: 25000,
      location: 'İstanbul',
      seller: {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com'
      }
    };
  } catch (error) {
    console.error('İlan yükleme hatası:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/ilan/${listingId}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-alo-orange transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>İlana Dön</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Şikayet Bildirimi</h1>
          </div>
          
          {listing && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{listing.title}</h2>
              <div className="text-gray-600">
                <p>Fiyat: {listing.price} TL</p>
                <p>Konum: {listing.location}</p>
                <p>Satıcı: {listing.seller.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Şikayet Formu */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800">Şikayet Nedeni Seçin</h3>
          </div>

          <div className="space-y-4 mb-6">
            {reportReasons.map((reason) => (
              <label
                key={reason.id}
                className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:border-gray-300"
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.id}
                  className="mt-1 text-alo-orange focus:ring-alo-orange"
                />
                <div>
                  <div className="font-medium text-gray-800">{reason.label}</div>
                  <div className="text-sm text-gray-600">{reason.description}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange focus:border-transparent"
              rows={4}
              placeholder="Şikayetinizi detaylı olarak açıklayın..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Link 
              href={`/ilan/${listingId}`}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              İptal
            </Link>
            <button className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
              <Send className="w-4 h-4" />
              <span>Şikayet Gönder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 