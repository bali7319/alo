'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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

export default function IlanSikayetPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const listingId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return;
      
      try {
        // Mock veri - gerçek uygulamada API'den gelecek
        const mockListing = {
          id: listingId,
          title: 'iPhone 14 Pro Max',
          price: 25000,
          location: 'İstanbul',
          seller: {
            name: 'Ahmet Yılmaz',
            email: 'ahmet@example.com'
          }
        };
        
        setListing(mockListing);
      } catch (error) {
        console.error('İlan yükleme hatası:', error);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleSubmit = async () => {
    if (!selectedReason || !description.trim() || !session) return;

    setIsSubmitting(true);
    
    try {
      // Mock API call - gerçek uygulamada backend'e gönderilecek
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Şikayet gönderildi:', {
        listingId: listingId,
        reason: selectedReason,
        description,
        userId: session.user.id,
        timestamp: new Date()
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Şikayet gönderme hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Şikayet Bildirimi</h1>
            <p className="text-gray-600">Şikayet bildirmek için giriş yapın.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Şikayetiniz Alındı</h1>
            <p className="text-gray-600 mb-6">
              Şikayetiniz başarıyla gönderildi. Ekibimiz en kısa sürede inceleyecek ve gerekli aksiyonları alacaktır.
            </p>
            <div className="space-y-3">
              <Link 
                href={`/ilan/${listingId}`}
                className="inline-block bg-alo-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
              >
                İlana Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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
                className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedReason === reason.id
                    ? 'border-alo-orange bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.id}
                  checked={selectedReason === reason.id}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mt-1 text-alo-orange focus:ring-alo-orange"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{reason.label}</h4>
                  <p className="text-sm text-gray-600">{reason.description}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detaylı Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange focus:border-transparent"
              rows={6}
              placeholder="Şikayetinizi detaylı bir şekilde açıklayın. Bu bilgiler sorunu çözmemize yardımcı olacaktır."
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum 20 karakter yazmanız gerekmektedir.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Önemli Bilgi</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Şikayetleriniz gizlilik içinde değerlendirilir. Yanlış şikayetler hesabınızın kısıtlanmasına neden olabilir.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link 
              href={`/ilan/${listingId}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              İptal
            </Link>
            <button
              onClick={handleSubmit}
              disabled={!selectedReason || description.length < 20 || isSubmitting}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Şikayeti Gönder</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ek Bilgiler */}
        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Şikayet Süreci</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Şikayet Alınır</h4>
                <p className="text-sm text-gray-600">Şikayetiniz sistemimize kaydedilir</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">İnceleme</h4>
                <p className="text-sm text-gray-600">Ekibimiz şikayetinizi detaylı olarak inceler</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Aksiyon</h4>
                <p className="text-sm text-gray-600">Gerekli aksiyonlar alınır ve size bilgi verilir</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 