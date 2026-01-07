'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CreditCard, Shield, Lock, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

function PaytrPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [paytrData, setPaytrData] = useState<PayTRResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/giris?callbackUrl=' + encodeURIComponent('/odeme/paytr'));
      return;
    }

    initializePayment();
  }, [session, searchParams]);

  const initializePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // URL'den veya localStorage'dan ödeme bilgilerini al
      const listingId = searchParams.get('listingId');
      const storedData = typeof window !== 'undefined' ? localStorage.getItem('paymentData') : null;
      
      if (!storedData && !listingId) {
        setError('Ödeme bilgileri bulunamadı');
        setIsLoading(false);
        return;
      }

      let paymentData;
      if (storedData) {
        paymentData = JSON.parse(storedData);
      } else {
        setError('Ödeme bilgileri bulunamadı. Lütfen tekrar deneyin.');
        setIsLoading(false);
        return;
      }

      // PayTR'yi başlat
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listingId || paymentData.listingId,
          amount: paymentData.totalAmount || paymentData.planPrice,
          currency: 'TL',
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
      setError(error.message || 'Ödeme başlatılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Formu otomatik submit et
  useEffect(() => {
    if (paytrData && formRef.current) {
      // Kısa bir gecikme ile formu submit et (iframe'in hazır olması için)
      const timer = setTimeout(() => {
        setIsSubmitting(true);
        formRef.current?.submit();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [paytrData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ödeme Hazırlanıyor</h2>
          <p className="text-gray-600">Güvenli ödeme sayfası yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ödeme Başlatılamadı</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/ilanlarim')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                İlanlarım Sayfasına Dön
              </button>
              <button
                onClick={initializePayment}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paytrData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Güvenli Ödeme</h1>
                  <p className="text-gray-600 text-sm">PayTR ile güvenli ödeme yapın</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>256-bit SSL</span>
              </div>
            </div>
          </div>

          {/* Güvenlik Uyarısı */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Güvenli Ödeme</h3>
                <p className="text-sm text-blue-800">
                  Ödeme işleminiz SSL ile şifrelenmiş güvenli bir ortamda gerçekleştirilmektedir. 
                  Kart bilgileriniz PayTR sunucularında saklanmaz ve bize iletilmez.
                </p>
              </div>
            </div>
          </div>

          {/* PayTR Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {isSubmitting ? (
              <div className="p-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">PayTR Ödeme Sayfasına Yönlendiriliyorsunuz...</h3>
                <p className="text-gray-600">Lütfen bekleyin, güvenli ödeme sayfası açılıyor.</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Ödeme Detayları</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Toplam Tutar: <span className="font-semibold text-gray-900">{paytrData.payment_amount.toFixed(2)} {paytrData.currency}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Sipariş No</p>
                    <p className="text-sm font-mono text-gray-900">{paytrData.merchant_oid}</p>
                  </div>
                </div>

                <form
                  ref={formRef}
                  method="POST"
                  action="https://www.paytr.com/odeme/guvenli"
                  target="paytr_iframe"
                  className="hidden"
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

                {/* PayTR Iframe */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
                  <iframe
                    ref={iframeRef}
                    name="paytr_iframe"
                    id="paytr_iframe"
                    src="about:blank"
                    className="w-full"
                    style={{ minHeight: '600px', border: 'none' }}
                    title="PayTR Ödeme Sayfası"
                  />
                </div>

                {/* PayTR Logo */}
                <div className="mt-6 flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Güvenli ödeme sağlayıcısı:</p>
                  <img
                    src="https://www.paytr.com/img/odeme-logo.png"
                    alt="PayTR"
                    className="h-8 opacity-70"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bilgilendirme */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-1">Ödeme Bilgileri</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Tüm kredi kartları ve banka kartları kabul edilir</li>
                  <li>• 3D Secure ile güvenli ödeme</li>
                  <li>• Anında onay ve işlem</li>
                  <li>• 7/24 müşteri desteği</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaytrPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <PaytrPageContent />
    </Suspense>
  );
}
