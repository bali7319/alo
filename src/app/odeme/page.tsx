'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, FileText, Lock, Shield } from 'lucide-react';

interface PaymentData {
  listingId?: string;
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

function OdemePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL'den veya localStorage'dan ödeme bilgilerini al
    const listingId = searchParams.get('listingId');
    const storedData = typeof window !== 'undefined' ? localStorage.getItem('paymentData') : null;
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        
        // Ücretsiz plan veya ödeme gerektirmeyen durum kontrolü
        if (data.planType === 'none' && (!data.premiumFeaturesPrice || data.premiumFeaturesPrice === 0)) {
          // Ücretsiz plan seçilmiş, ödeme sayfasına gerek yok
          console.log('Ücretsiz plan seçilmiş, ödeme sayfasına gerek yok');
          router.push(`/ilan-ver/onizle/${listingId || data.listingId}`);
          return;
        }
        
        // Toplam tutar kontrolü - 0 veya negatif ise ödeme sayfasına gerek yok
        if (!data.totalAmount || data.totalAmount <= 0) {
          console.log('Ödeme tutarı 0 veya negatif, ödeme sayfasına gerek yok');
          router.push(`/ilan-ver/onizle/${listingId || data.listingId}`);
          return;
        }
        
        setPaymentData({ ...data, listingId: listingId || data.listingId });
      } catch (error) {
        console.error('Ödeme verisi parse edilemedi:', error);
        router.push('/ilan-ver');
      }
    } else {
      // PaymentData yoksa, ücretsiz plan seçilmiş olabilir - önizleme sayfasına yönlendir
      if (listingId) {
        router.push(`/ilan-ver/onizle/${listingId}`);
      } else {
        router.push('/ilan-ver');
      }
    }
  }, [searchParams, router]);


  const initializePayTR = async () => {
    if (!paymentData || !session?.user || !paymentData.listingId) {
      setError('Ödeme bilgileri eksik. Lütfen tekrar deneyin.');
      return;
    }

    // Fatura bilgileri kontrolü
    if (!paymentData.billingName || !paymentData.billingEmail) {
      setError('Lütfen fatura bilgilerini doldurun.');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: paymentData.listingId,
          amount: paymentData.totalAmount,
          currency: 'TL',
          planType: paymentData.planType,
          premiumFeaturesPrice: paymentData.premiumFeaturesPrice ?? 0,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'PayTR başlatılamadı');
      }

      // PayTR verilerini URL parametreleri olarak yeni sayfaya yönlendir
      const params = new URLSearchParams({
        merchant_id: result.merchant_id,
        user_ip: result.user_ip,
        merchant_oid: result.merchant_oid,
        email: result.email,
        payment_amount: result.payment_amount.toString(),
        paytr_token: result.paytr_token,
        user_basket: result.user_basket,
        debug_on: result.debug_on.toString(),
        no_installment: result.no_installment.toString(),
        max_installment: result.max_installment.toString(),
        user_name: result.user_name,
        user_address: result.user_address,
        user_phone: result.user_phone,
        merchant_ok_url: result.merchant_ok_url,
        merchant_fail_url: result.merchant_fail_url,
        timeout_limit: result.timeout_limit.toString(),
        currency: result.currency,
        test_mode: result.test_mode.toString(),
      });

      // Yeni yönlendirme sayfasına git
      router.push(`/odeme/paytr-yonlendir?${params.toString()}`);
      
    } catch (error: any) {
      console.error('PayTR başlatma hatası:', error);
      setError(error.message || 'Ödeme başlatılırken bir hata oluştu.');
      setIsInitializing(false);
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // KDV hesaplama
  const taxRate = 20; // %20 KDV
  const amountWithoutTax = paymentData.totalAmount / (1 + taxRate / 100);
  const taxAmount = paymentData.totalAmount - amountWithoutTax;


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ödeme</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ödeme Özeti */}
          <div className="lg:col-span-2">
            {/* Fatura Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Fatura Bilgileri
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad / Firma Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentData.billingName}
                    onChange={(e) => {
                      const updated = { ...paymentData, billingName: e.target.value };
                      setPaymentData(updated);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('paymentData', JSON.stringify(updated));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={paymentData.billingEmail}
                    onChange={(e) => {
                      const updated = { ...paymentData, billingEmail: e.target.value };
                      setPaymentData(updated);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('paymentData', JSON.stringify(updated));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={paymentData.billingPhone || ''}
                    onChange={(e) => {
                      const updated = { ...paymentData, billingPhone: e.target.value };
                      setPaymentData(updated);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('paymentData', JSON.stringify(updated));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    value={paymentData.billingAddress || ''}
                    onChange={(e) => {
                      const updated = { ...paymentData, billingAddress: e.target.value };
                      setPaymentData(updated);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('paymentData', JSON.stringify(updated));
                      }
                    }}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TC Kimlik No / Vergi No
                  </label>
                  <input
                    type="text"
                    value={paymentData.billingTaxId || ''}
                    onChange={(e) => {
                      const updated = { ...paymentData, billingTaxId: e.target.value };
                      setPaymentData(updated);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('paymentData', JSON.stringify(updated));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Özet */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ödeme Özeti</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{paymentData.planName}</span>
                  <span>{paymentData.planPrice.toFixed(2)} ₺</span>
                </div>
                
                {paymentData.premiumFeatures.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Premium Özellikler:</p>
                    {paymentData.premiumFeatures.map((feature, index) => (
                      <div key={index} className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{feature}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-gray-600 mt-2">
                      <span>Toplam Premium</span>
                      <span>{paymentData.premiumFeaturesPrice.toFixed(2)} ₺</span>
                    </div>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>KDV Hariç</span>
                    <span>{amountWithoutTax.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>KDV (%{taxRate})</span>
                    <span>{taxAmount.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>Toplam</span>
                    <span>{paymentData.totalAmount.toFixed(2)} ₺</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={initializePayTR}
                disabled={isInitializing || !paymentData.billingName || !paymentData.billingEmail}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    PayTR'ye Bağlanılıyor...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    PayTR ile Güvenli Ödeme
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Lock className="w-4 h-4" />
                <span>256-bit SSL şifreleme ile korunmaktadır</span>
              </div>
              
              <div className="mt-4 flex items-center justify-center gap-4">
                <img 
                  src="https://www.paytr.com/img/odeme-logo.png" 
                  alt="PayTR" 
                  className="h-8 opacity-60"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OdemePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <OdemePageContent />
    </Suspense>
  );
}
