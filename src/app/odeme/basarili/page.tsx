'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Ödeme Başarılı!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Premium ilanınız başarıyla yayınlandı. İlanınız artık sitede görünür durumda.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/profil/ilanlarim"
              className="block w-full bg-alo-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-alo-light-orange transition-colors"
            >
              İlanlarımı Görüntüle
            </Link>
            
            <Link
              href="/"
              className="block w-full text-gray-600 hover:text-alo-orange transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
