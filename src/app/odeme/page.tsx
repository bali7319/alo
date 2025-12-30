'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { CreditCard, CheckCircle, XCircle, Loader2, FileText, Mail, Lock, Shield } from 'lucide-react';

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

interface PayTRResponse {
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

function OdemePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [paytrData, setPaytrData] = useState<PayTRResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const paytrFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // URL'den veya localStorage'dan ödeme bilgilerini al
    const listingId = searchParams.get('listingId');
    const storedData = typeof window !== 'undefined' ? localStorage.getItem('paymentData') : null;
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setPaymentData({ ...data, listingId: listingId || data.listingId });
      } catch (error) {
        console.error('Ödeme verisi parse edilemedi:', error);
        router.push('/ilan-ver');
      }
    } else {
      router.push('/ilan-ver');
    }
  }, [searchParams, router]);

  // PayTR formunu otomatik submit et
  useEffect(() => {
    if (paytrData && paytrFormRef.current) {
      // Kısa bir gecikme ile formu submit et (iframe'in yüklenmesi için)
      setTimeout(() => {
        paytrFormRef.current?.submit();
      }, 500);
    }
  }, [paytrData]);

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
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'PayTR başlatılamadı');
      }

      // PayTR verilerini kaydet
      setPaytrData(result);
      
    } catch (error: any) {
      console.error('PayTR başlatma hatası:', error);
      setError(error.message || 'Ödeme başlatılırken bir hata oluştu.');
    } finally {
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

  // PayTR iframe gösteriliyorsa
  if (paytrData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-green-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Güvenli Ödeme - PayTR</h1>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Ödeme işleminiz SSL ile şifrelenmiş güvenli bir ortamda gerçekleştirilmektedir.
              </p>
            </div>

            {/* PayTR Form */}
            <form
              ref={paytrFormRef}
              method="POST"
              action="https://www.paytr.com/odeme/guvenli"
              id="paytr-form"
            >
              <input type="hidden" name="merchant_id" value={paytrData.merchant_id} />
              <input type="hidden" name="user_ip" value={paytrData.user_ip} />
              <input type="hidden" name="merchant_oid" value={paytrData.merchant_oid} />
              <input type="hidden" name="email" value={paytrData.email} />
              <input type="hidden" name="payment_amount" value={paytrData.payment_amount} />
              <input type="hidden" name="paytr_token" value={paytrData.paytr_token} />
              <input type="hidden" name="user_basket" value={paytrData.user_basket} />
              <input type="hidden" name="debug_on" value={paytrData.debug_on} />
              <input type="hidden" name="no_installment" value={paytrData.no_installment} />
              <input type="hidden" name="max_installment" value={paytrData.max_installment} />
              <input type="hidden" name="user_name" value={paytrData.user_name} />
              <input type="hidden" name="user_address" value={paytrData.user_address} />
              <input type="hidden" name="user_phone" value={paytrData.user_phone} />
              <input type="hidden" name="merchant_ok_url" value={paytrData.merchant_ok_url} />
              <input type="hidden" name="merchant_fail_url" value={paytrData.merchant_fail_url} />
              <input type="hidden" name="timeout_limit" value={paytrData.timeout_limit} />
              <input type="hidden" name="currency" value={paytrData.currency} />
              <input type="hidden" name="test_mode" value={paytrData.test_mode} />
            </form>

            {/* Loading indicator */}
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">PayTR ödeme sayfasına yönlendiriliyorsunuz...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
