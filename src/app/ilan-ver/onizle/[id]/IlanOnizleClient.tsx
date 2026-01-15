'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Edit, CreditCard, Send, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subCategory: string | null;
  location: string;
  phone: string | null;
  images: string;
  features: string;
  isPremium: boolean;
  premiumFeatures: string | null;
  approvalStatus: string;
  createdAt: string;
}

interface PaymentData {
  listingId: string;
  planType: string;
  planName: string;
  planPrice: number;
  premiumFeatures: string[];
  premiumFeaturesPrice: number;
  totalAmount: number;
  billingName: string;
  billingEmail: string;
  billingPhone?: string;
  billingAddress?: string;
  billingTaxId?: string;
}

interface IlanOnizlePageProps {
  id: string;
}

export default function IlanOnizlePageContent({ id }: IlanOnizlePageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [listing, setListing] = useState<Listing | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ID prop'tan direkt kullan, state'e gerek yok
  const listingId = id || null;

  useEffect(() => {
    // ID kontrolü
    if (!id) {
      console.error('İlan ID bulunamadı. ID prop:', id);
      // localStorage'dan fallback dene
      if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem('paymentData');
        if (storedData) {
          try {
            const data = JSON.parse(storedData);
            if (data.listingId) {
              console.log('ID localStorage\'dan alindi:', data.listingId);
              // ID yoksa localStorage'dan al, ama bu durumda sayfayı yeniden yönlendir
              router.push(`/ilan-ver/onizle/${data.listingId}`);
              return;
            }
          } catch (error) {
            console.error('Ödeme verisi parse edilemedi:', error);
          }
        }
      }
      setError('İlan ID bulunamadı. Lütfen ilan ver sayfasından tekrar deneyin.');
      setLoading(false);
      return;
    }
    
    console.log('İlan ID prop\'tan alindi:', id);
  }, [id, router]);

  useEffect(() => {
    if (id) {
      // Session varsa veya yoksa bile ilanı yükle
      fetchListing();
      loadPaymentData();
    }
  }, [id, session]);

  const fetchListing = async () => {
    if (!id) {
      setError('İlan ID bulunamadı');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('İlan yükleniyor, ID:', id);
      
      const response = await fetch(`/api/listings/${id}`);
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('API hatası:', response.status, responseData);
        throw new Error(responseData.error || `İlan yüklenemedi (${response.status})`);
      }

      if (!responseData.listing) {
        throw new Error('İlan bulunamadı');
      }

      setListing(responseData.listing);
      console.log('İlan başarıyla yüklendi:', responseData.listing.id);
    } catch (error: any) {
      console.error('İlan yükleme hatası:', error);
      setError(error.message || 'İlan yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentData = () => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('paymentData');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          
          // Sadece premium plan veya premium özellik varsa paymentData'yı set et
          if (data.planType !== 'none' || (data.premiumFeaturesPrice && data.premiumFeaturesPrice > 0)) {
            // Listing ID kontrolü - eğer bu ilan için değilse temizle
            if (data.listingId && data.listingId !== id && data.listingId !== listing?.id) {
              // Farklı bir ilan için paymentData, temizle
              localStorage.removeItem('paymentData');
              setPaymentData(null);
            } else {
              setPaymentData(data);
            }
          } else {
            // Ücretsiz plan seçilmiş, paymentData'yı temizle
            localStorage.removeItem('paymentData');
            setPaymentData(null);
          }
        } catch (error) {
          console.error('Ödeme verisi parse edilemedi:', error);
          localStorage.removeItem('paymentData');
          setPaymentData(null);
        }
      }
    }
  };

  const handleProceedToPayment = () => {
    const listingIdToUse = listing?.id || id;
    if (paymentData && listingIdToUse) {
      router.push(`/odeme?listingId=${listingIdToUse}`);
    } else {
      alert('Ödeme bilgileri bulunamadı. Lütfen ilanı tekrar oluşturun.');
      router.push('/ilan-ver');
    }
  };

  const handleSubmitForApproval = async () => {
    const listingIdToUse = listing?.id || id;
    if (!listingIdToUse) return;

    // Premium plan seçilmişse ve ödeme yapılmamışsa onaya gönderme
    if (hasPayment) {
      alert('Premium plan seçilmiş. Lütfen önce ödemeyi tamamlayın.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // İlan zaten oluşturulmuş, sadece onay durumunu kontrol et
      // Eğer approvalStatus 'pending' değilse, güncelle
      const listingIdToUse = listing?.id || id;
      if (!listing || listing.approvalStatus !== 'pending') {
        const response = await fetch(`/api/listings/${listingIdToUse}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            approvalStatus: 'pending',
          }),
        });

        if (!response.ok) {
          throw new Error('İlan onaya gönderilemedi');
        }
      }

      // Başarı mesajı ve yönlendirme
      alert('İlanınız başarıyla onaya gönderildi. Moderatör onayından sonra yayınlanacaktır.');
      router.push('/ilanlarim');
    } catch (error: any) {
      console.error('Onaya gönderme hatası:', error);
      setError(error.message || 'İlan onaya gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">İlan yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Hata Oluştu</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => router.push('/ilan-ver')}
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              İlan Ver Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  // Güvenli resim parse fonksiyonu - Base64 kontrolü ile
  const parseImages = (images: string | null): string[] => {
    if (!images) return [];
    
    // Base64 resim kontrolü - eğer veri zaten Base64 resim ise parse etme
    if (typeof images === 'string' && images.startsWith('data:image')) {
      return [images];
    }
    
    // Zaten array ise direkt döndür
    if (Array.isArray(images)) {
      return images;
    }
    
    // JSON parse denemesi - sadece JSON formatında ise
    if (typeof images === 'string' && (images.startsWith('[') || images.startsWith('{'))) {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) return parsed;
        return parsed ? [parsed] : [];
      } catch (e) {
        console.error('JSON Parse Hatası:', e);
        return [images];
      }
    }
    
    return typeof images === 'string' ? [images] : [];
  };

  // Güvenli JSON parse fonksiyonu
  const safeParseJson = (data: string | null): any => {
    if (!data) return null;
    
    // Base64 kontrolü
    if (typeof data === 'string' && data.startsWith('data:image')) {
      return data;
    }
    
    // Zaten object ise direkt döndür
    if (typeof data === 'object') {
      return data;
    }
    
    // JSON parse denemesi
    if (typeof data === 'string' && (data.startsWith('[') || data.startsWith('{'))) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('JSON Parse Hatası:', e);
        return null;
      }
    }
    
    return data;
  };

  const images = parseImages(listing.images);
  const features = listing.features ? parseImages(listing.features) : [];
  const premiumFeatures = listing.premiumFeatures ? safeParseJson(listing.premiumFeatures) : null;

  // Ödeme gerekip gerekmediğini kontrol et
  // Premium plan seçilmişse veya premium özellik fiyatı varsa ödeme gerekli
  const hasPayment = paymentData && 
    paymentData.totalAmount > 0 && 
    (paymentData.planType !== 'none' || (paymentData.premiumFeaturesPrice && paymentData.premiumFeaturesPrice > 0));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/ilan-ver')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            İlan Ver Sayfasına Dön
          </button>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  İlan Önizleme
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>İlanınızı kontrol edin. Her şey doğruysa, {hasPayment ? 'ödemeye geçebilir' : 'onaya gönderebilir'}siniz.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* İlan Önizleme */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Resimler */}
          {images.length > 0 && (
            <div className="relative h-96 bg-gray-200">
              <Image
                src={images[0]}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-6">
            {/* Başlık ve Fiyat */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{listing.category}</span>
                  {listing.subCategory && (
                    <>
                      <span>/</span>
                      <span>{listing.subCategory}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {listing.price.toLocaleString('tr-TR')} ₺
                </div>
              </div>
            </div>

            {/* Premium Badge */}
            {listing.isPremium && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Premium İlan
                </span>
              </div>
            )}

            {/* Açıklama */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Açıklama</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Özellikler */}
            {features.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Özellikler</h2>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {features.map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Konum */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Konum</h2>
              <p className="text-gray-700">{listing.location}</p>
            </div>

            {/* İletişim */}
            {listing.phone && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">İletişim</h2>
                <p className="text-gray-700">{listing.phone}</p>
              </div>
            )}

            {/* Premium Özellikler */}
            {premiumFeatures && premiumFeatures.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Premium Özellikler</h2>
                <div className="flex flex-wrap gap-2">
                  {premiumFeatures.map((feature: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {feature === 'featured' && 'Öne Çıkan'}
                      {feature === 'urgent' && 'Acil'}
                      {feature === 'highlight' && 'Vurgulu'}
                      {feature === 'topPosition' && 'Üst Sırada'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hata Mesajı */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 pt-6 border-t">
              <Link
                href={`/ilan-ver/duzenle/${listing.id}`}
                className="w-full sm:w-auto sm:min-w-[200px] inline-flex items-center justify-center whitespace-nowrap px-8 py-4 text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                <Edit className="w-5 h-5 mr-2" />
                Düzenle
              </Link>

              {hasPayment ? (
                <>
                  <button
                    onClick={handleProceedToPayment}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center whitespace-nowrap px-8 py-4 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {isSubmitting ? 'Yönlendiriliyor...' : 'Ödemeye Geç'}
                  </button>
                  <div className="w-full text-center text-sm text-yellow-600 mt-2">
                    ⚠️ Premium plan seçilmiş. Ödeme yapmadan ilan onaya gönderilemez.
                  </div>
                </>
              ) : (
                <button
                  onClick={handleSubmitForApproval}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center whitespace-nowrap px-8 py-4 text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Onaya Gönder
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

