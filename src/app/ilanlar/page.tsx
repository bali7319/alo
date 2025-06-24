'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MapPin, Star, Eye } from 'lucide-react';
import { categories } from '../../lib/categories';

function generateSampleListing({ category, subcategory, subsubcategory, index }: any) {
  const id = `${category.slug}-${subcategory?.slug || 'ana'}-${subsubcategory?.slug || 'ana'}-${index}`;
  return {
    id,
    title: `${category.name}${subcategory ? ' / ' + subcategory.name : ''}${subsubcategory ? ' / ' + subsubcategory.name : ''} için Örnek İlan`,
    price: 1000 + index * 100,
    location: 'İstanbul',
    description: `${category.name}${subcategory ? ' / ' + subcategory.name : ''}${subsubcategory ? ' / ' + subsubcategory.name : ''} için otomatik oluşturulmuş örnek ilan açıklaması.`,
    category: category.slug,
    subcategory: subcategory?.slug || '',
    isPremium: index % 2 === 0,
    premiumUntil: null,
    features: ['Otomatik', 'Demo'],
    images: [
      `https://picsum.photos/seed/${id}/500/300`
    ],
    seller: {
      id: 'demo',
      name: 'Demo Kullanıcı',
      email: 'demo@email.com',
      phone: '+90 555 555 55 55'
    },
    createdAt: new Date(),
    views: 100 + index * 10,
    condition: 'Yeni',
    brand: 'Demo',
    model: 'Demo',
    year: 2024,
    approvalStatus: 'approved'
  };
}

function getAllSampleListings() {
  let listings: any[] = [];
  let index = 1;
  for (const category of categories) {
    // Ana kategori ilanı
    listings.push(generateSampleListing({ category, index }));
    index++;
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        // Alt kategori ilanı
        listings.push(generateSampleListing({ category, subcategory, index }));
        index++;
        if (subcategory.subcategories) {
          for (const subsubcategory of subcategory.subcategories) {
            // Alt-alt kategori ilanı
            listings.push(generateSampleListing({ category, subcategory, subsubcategory, index }));
            index++;
          }
        }
      }
    }
  }
  return listings;
}

export default function IlanlarPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const ilanlar = getAllSampleListings();

  const handleIlanClick = (ilanId: string) => {
    router.push(`/ilan/${ilanId}`);
  };

  const handleNewIlan = () => {
    if (!session) {
      router.push('/giris?callbackUrl=/ilan-ver');
      return;
    }
    router.push('/ilan-ver');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tüm İlanlar</h1>
        <button
          onClick={handleNewIlan}
          className="bg-alo-orange text-white px-6 py-2 rounded-lg hover:bg-alo-dark-orange transition-colors"
        >
          Yeni İlan Ver
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ilanlar.map((ilan) => (
          <div
            key={ilan.id}
            onClick={() => handleIlanClick(ilan.id)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-100"
          >
            <div className="relative h-48">
              <img
                src={ilan.images[0]}
                alt={ilan.title}
                className="w-full h-full object-cover"
              />
              {ilan.isPremium && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {ilan.views}
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2">
                {ilan.title}
              </h2>
              <p className="text-2xl font-bold text-alo-orange mb-2">
                {ilan.price === 0 ? 'Ücretsiz' : `${ilan.price.toLocaleString('tr-TR')} ₺`}
              </p>
              <div className="flex items-center text-gray-500 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{ilan.location}</span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {ilan.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {ilan.features.slice(0, 2).map((feature: string, index: number) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 