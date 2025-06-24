import ListingDetail from './ListingDetail';

// generateStaticParams fonksiyonu ekle
export async function generateStaticParams() {
  // Örnek olarak ilk 10 ilanı statik olarak oluştur
  const listings = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
    { id: '10' }
  ];
  
  return listings.map((listing) => ({
    id: listing.id,
  }));
}

export default function ListingDetailPage() {
  return <ListingDetail />;
} 