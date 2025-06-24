'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { listingTypes } from '@/types/listings';

// PayTR için gerekli tipler
interface PayTRFormData {
  merchant_id: string;
  user_ip: string;
  merchant_oid: string;
  email: string;
  payment_amount: number;
  paytr_token: string;
  user_basket: string;
  debug_on: number;
  no_installment: number;
  max_installment: number;
  user_name: string;
  user_address: string;
  user_phone: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  timeout_limit: number;
  currency: string;
  test_mode: number;
}

// Örnek veri - Gerçek uygulamada API'den gelecek
const listing = {
  id: 1,
  title: 'iPhone 14 Pro Max 256GB',
  price: '45.000',
  type: listingTypes.PREMIUM,
  premiumFeatures: {
    price: 149.00,
    duration: 30,
  }
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PayTRFormData | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        if (!searchParams) {
          setError('Arama parametreleri bulunamadı');
          setLoading(false);
          return;
        }
        // API'den PayTR token'ı al
        const response = await fetch('/api/payment/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listingId: searchParams.get('listingId'),
            amount: listing.premiumFeatures.price,
            currency: 'TL',
          }),
        });

        if (!response.ok) {
          throw new Error('Ödeme başlatılamadı');
        }

        const data = await response.json();
        setFormData(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        setLoading(false);
      }
    };

    initializePayment();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      // PayTR iframe'ini aç
      const paytrIframe = document.createElement('iframe');
      paytrIframe.src = 'https://www.paytr.com/odeme/guvenli';
      paytrIframe.style.width = '100%';
      paytrIframe.style.height = '100%';
      paytrIframe.style.border = 'none';
      
      const iframeContainer = document.getElementById('paytr-iframe-container');
      if (iframeContainer) {
        iframeContainer.innerHTML = '';
        iframeContainer.appendChild(paytrIframe);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ödeme işlemi başlatılamadı');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alo-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Ödeme hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hata Oluştu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-block bg-alo-orange text-white px-6 py-2 rounded-lg hover:bg-alo-light-orange transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Ödeme Özeti */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-alo-dark mb-6">Ödeme Özeti</h1>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">İlan Başlığı</span>
                <span className="font-medium">{listing.title}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">Premium Üyelik</span>
                <span className="font-medium">{listing.premiumFeatures.duration} Gün</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">Premium Özellikler</span>
                <ul className="text-right text-sm text-gray-600">
                  <li>• 5 adet resim yükleme</li>
                  <li>• İlan öne çıkarma</li>
                  <li>• Premium rozeti</li>
                </ul>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">Toplam Tutar</span>
                <span className="text-xl font-bold text-alo-orange">{listing.premiumFeatures.price} TL</span>
              </div>
            </div>
          </div>

          {/* Ödeme Formu */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-alo-dark mb-6">Ödeme Bilgileri</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PayTR iframe container */}
              <div id="paytr-iframe-container" className="w-full h-[600px] border rounded-lg"></div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-alo-orange"
                >
                  ← Vazgeç
                </Link>
                
                <button
                  type="submit"
                  className="bg-alo-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-alo-light-orange transition-colors"
                >
                  Ödemeyi Tamamla
                </button>
              </div>
            </form>
          </div>

          {/* Güvenli Ödeme Bilgisi */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>256-bit SSL ile Güvenli Ödeme</span>
            </div>
            <p>PayTR güvenli ödeme altyapısı kullanılmaktadır.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
