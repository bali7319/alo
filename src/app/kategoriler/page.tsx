import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { CategoryIcon } from '@/components/category-icon';

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

// Basit kategoriler listesi
const categories = [
  { name: "İş", slug: "is" },
  { name: "Hizmetler", slug: "hizmetler" },
  { name: "Elektronik", slug: "elektronik" },
  { name: "Ev & Bahçe", slug: "ev-ve-bahce" },
  { name: "Giyim", slug: "giyim" },
  { name: "Moda & Stil", slug: "moda-stil" },
  { name: "Sporlar, Oyunlar ve Eğlenceler", slug: "sporlar-oyunlar-eglenceler" },
  { name: "Anne & Bebek", slug: "anne-bebek" },
  { name: "Çocuk Dünyası", slug: "cocuk-dunyasi" },
  { name: "Eğitim & Kurslar", slug: "egitim-kurslar" },
  { name: "Yemek & İçecek", slug: "yemek-icecek" },
  { name: "Catering & Ticaret", slug: "catering-ticaret" },
  { name: "Turizm & Konaklama", slug: "turizm-konaklama" },
  { name: "Sağlık & Güzellik", slug: "saglik-guzellik" },
  { name: "Sanat & Hobi", slug: "sanat-hobi" },
  { name: "Ücretsiz Gel Al", slug: "ucretsiz-gel-al" }
];

function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kategoriler
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            İhtiyacınız olan ürün veya hizmeti bulmak için kategorilerimizi keşfedin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategori/${category.slug}`}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-white rounded-xl border border-gray-100 group-hover:border-gray-200 transition-colors">
                  <CategoryIcon slug={category.slug} alt={`${category.name} kategorisi simgesi`} size={64} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  0 alt kategori
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Aradığınız kategoriyi bulamadınız mı?
          </p>
          <Link
            href="/ilanlar"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Tüm İlanları Görüntüle
          </Link>
        </div>
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