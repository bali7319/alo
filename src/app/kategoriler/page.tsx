import { Suspense } from 'react';
import { Metadata } from 'next';
import { KategorilerClient } from './KategorilerClient';

export const metadata: Metadata = {
  title: 'Kategoriler - Tüm İlan Kategorileri | Alo17',
  description: 'Çanakkale\'de tüm ilan kategorilerini keşfedin. İş, elektronik, giyim, ev eşyaları, araç ve daha fazlası. İhtiyacınız olan ürün veya hizmeti bulun.',
  keywords: [
    'kategoriler',
    'ilan kategorileri',
    'çanakkale kategoriler',
    'tüm kategoriler',
    'alo17 kategoriler',
    'iş ilanları',
    'elektronik',
    'giyim',
    'ev eşyaları'
  ],
  openGraph: {
    title: 'Kategoriler - Tüm İlan Kategorileri | Alo17',
    description: 'Çanakkale\'de tüm ilan kategorilerini keşfedin. İş, elektronik, giyim ve daha fazlası.',
    url: 'https://alo17.tr/kategoriler',
    type: 'website',
  },
  alternates: {
    canonical: 'https://alo17.tr/kategoriler',
  },
};

function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KategorilerClient />
      </div>
    </div>
  );
}

export default function CategoriesPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kategoriler yükleniyor...</p>
        </div>
      </div>
    }>
      <CategoriesPage />
    </Suspense>
  );
} 