import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'

// generateStaticParams fonksiyonu ekle
export async function generateStaticParams() {
  // Restoran alt kategorileri için statik parametreler oluştur
  const altKategoriler = [
    'turk-mutfagi',
    'italyan-mutfagi',
    'cin-mutfagi',
    'japon-mutfagi',
    'fast-food',
    'pizza',
    'burger',
    'kebap',
    'balik',
    'vejetaryen',
    'vegan',
    'tatli',
    'kahve',
    'icecek'
  ];
  
  return altKategoriler.map((altKategori) => ({
    altKategori: altKategori,
  }));
}

export default async function RestoranAltKategoriPage({ params }: { params: Promise<{ altKategori: string }> }) {
  const { altKategori } = await params;

  // İlgili alt kategoriye ait restoran ilanlarını filtrele
  const filteredListings = listings.filter(listing =>
    listing.category === 'yemek-icecek' &&
    listing.subCategory === 'restoranlar'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 capitalize">{altKategori.replace(/-/g, ' ')}</h1>
        <p className="text-gray-600 mt-2">
          {altKategori.replace(/-/g, ' ')} kategorisindeki restoranlar
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        ) : (
          <div className="text-center py-12 col-span-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Restoran Bulunamadı
            </h3>
            <p className="text-gray-600">
              Seçtiğiniz alt kategoriye uygun restoran bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 