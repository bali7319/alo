'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Script from 'next/script';

function PaytrYonlendirContent() {
  const searchParams = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    // Form verilerini URL'den al
    const merchant_id = searchParams.get('merchant_id');
    const user_ip = searchParams.get('user_ip');
    const merchant_oid = searchParams.get('merchant_oid');
    const email = searchParams.get('email');
    const payment_amount = searchParams.get('payment_amount');
    const paytr_token = searchParams.get('paytr_token');
    const user_basket = searchParams.get('user_basket');
    const debug_on = searchParams.get('debug_on');
    const no_installment = searchParams.get('no_installment');
    const max_installment = searchParams.get('max_installment');
    const user_name = searchParams.get('user_name');
    const user_address = searchParams.get('user_address');
    const user_phone = searchParams.get('user_phone');
    const merchant_ok_url = searchParams.get('merchant_ok_url');
    const merchant_fail_url = searchParams.get('merchant_fail_url');
    const timeout_limit = searchParams.get('timeout_limit');
    const currency = searchParams.get('currency');
    const test_mode = searchParams.get('test_mode');

    // Debug: Tüm parametreleri logla
    console.log('PayTR Yönlendirme Parametreleri:', {
      merchant_id,
      user_ip,
      merchant_oid,
      email,
      payment_amount,
      paytr_token: paytr_token ? paytr_token.substring(0, 20) + '...' : null,
      user_basket,
      no_installment,
      max_installment,
      user_name,
      user_address,
      user_phone,
      merchant_ok_url,
      merchant_fail_url,
      timeout_limit,
      currency,
      test_mode,
    });

    // PayTR iFrame API: Token ile direkt iframe src'sine yönlendir
    if (
      paytr_token &&
      iframeRef.current &&
      !submittedRef.current
    ) {
      submittedRef.current = true;
      
      // PayTR iFrame API: Token ile direkt URL oluştur (path olarak, query string değil)
      // Doğru format: https://www.paytr.com/odeme/guvenli/${token}
      const paytrIframeUrl = `https://www.paytr.com/odeme/guvenli/${encodeURIComponent(paytr_token)}`;
      console.log('PayTR iFrame URL oluşturuldu:', paytrIframeUrl.substring(0, 80) + '...');
      
      // Iframe src'sine direkt token URL'i set et
      if (iframeRef.current) {
        iframeRef.current.src = paytrIframeUrl;
        console.log('PayTR iframe src set edildi');
      }
    } else {
      console.error('PayTR yönlendirme için gerekli parametreler eksik:', {
        paytr_token: !!paytr_token,
        iframeRef: !!iframeRef.current,
      });
    }
  }, [searchParams]);

  return (
    <>
      {/* PayTR iFrame Resizer Script - iframe boyutunu otomatik ayarlar */}
      <Script
        src="https://www.paytr.com/js/iframeResizer.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('PayTR iframeResizer yüklendi');
          // @ts-ignore - PayTR iframeResizer global değişken
          if (typeof window !== 'undefined' && window.iFrameResize) {
            // @ts-ignore
            window.iFrameResize({}, '#paytr_iframe');
          }
        }}
      />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              PayTR Ödeme Sayfasına Yönlendiriliyorsunuz...
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Lütfen bekleyin, ödeme sayfası açılıyor.
            </p>
          </div>
          
          {/* PayTR Iframe - iFrame API ile direkt token URL'i kullanılıyor */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
            <iframe
              ref={iframeRef}
              name="paytr_iframe"
              id="paytr_iframe"
              src="about:blank"
              className="w-full"
              style={{ minHeight: '600px', border: 'none' }}
              title="PayTR Ödeme Sayfası"
              allow="payment"
              onLoad={() => {
                console.log('PayTR iframe yüklendi');
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaytrYonlendirPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    }>
      <PaytrYonlendirContent />
    </Suspense>
  );
}

