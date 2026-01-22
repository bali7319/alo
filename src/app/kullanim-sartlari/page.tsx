import React from 'react';
import Link from 'next/link';

export default function KullanimSartlari() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Kullanım Şartları</h1>
      <p className="text-gray-700">
        Alo17 platformunu kullanarak kullanım şartlarını kabul etmiş olursunuz. Güncel ve detaylı metin için{' '}
        <Link href="/kullanim-kosullari" className="text-blue-600 hover:underline">
          Kullanım Koşulları
        </Link>{' '}
        sayfasını inceleyin.
      </p>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Kullanıcı Sorumlulukları</h2>
      <p className="text-gray-700">
        Kullanıcılar, platform üzerinde yaptıkları işlemlerden sorumludur. Yasadışı veya uygunsuz içerik paylaşımı yasaktır.
      </p>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Hesap Güvenliği</h2>
      <p className="text-gray-700">
        Kullanıcılar, hesaplarının güvenliğinden sorumludur. Şifrelerini güvenli bir şekilde saklamalı ve başkalarıyla paylaşmamalıdırlar.
      </p>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Değişiklikler</h2>
      <p className="text-gray-700">
        Alo17, kullanım şartlarını herhangi bir zamanda değiştirme hakkını saklı tutar. Değişiklikler, platform üzerinde duyurulacaktır.
      </p>
    </div>
  );
} 
