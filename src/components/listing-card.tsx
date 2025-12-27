import Link from "next/link"
import Image from "next/image"
import { Star, Crown, Image as ImageIcon } from "lucide-react"
import { Listing } from '@/types/listings'
import { createSlug } from '@/lib/slug'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  // Resim URL'ini belirle
  const getImageUrl = () => {
    // Önce gerçek resimleri kontrol et
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
      const image = listing.images[0];
      // Base64 data URL veya normal URL kontrolü
      if (typeof image === 'string' && image.length > 0) {
        return image;
      }
    }
    // Resim yoksa null döndür
    return null;
  }

  const imageUrl = getImageUrl();
  const hasImage = imageUrl !== null;
  const isBase64 = hasImage && typeof imageUrl === 'string' && imageUrl.startsWith('data:image');

  const listingSlug = createSlug(listing.title);
  
  return (
    <Link 
      href={`/ilan/${listingSlug}`}
      className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
      aria-label={`${listing.title} ilanını görüntüle`}
    >
      <div className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
        listing.isPremium ? 'ring-2 ring-yellow-400 shadow-lg' : ''
      }`}>
        <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
          {/* Placeholder - resim yoksa veya yüklenemezse gösterilir */}
          <div className={`absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100 image-placeholder ${hasImage ? 'hidden' : ''}`}>
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
          
          {hasImage && (
            isBase64 ? (
              // Base64 resimler için normal img tag kullan (Next.js Image base64'ü optimize edemez)
              <img
                src={imageUrl}
                alt={listing.title || 'İlan resmi'}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Resim yüklenemezse placeholder göster
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.parentElement?.querySelector('.image-placeholder');
                  if (placeholder) {
                    (placeholder as HTMLElement).classList.remove('hidden');
                  }
                }}
              />
            ) : (
              <Image
                src={imageUrl}
                alt={listing.title || 'İlan resmi'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                loading="lazy"
                onError={(e) => {
                  // Resim yüklenemezse placeholder göster
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.parentElement?.querySelector('.image-placeholder');
                  if (placeholder) {
                    (placeholder as HTMLElement).classList.remove('hidden');
                  }
                }}
              />
            )
          )}
          
          {/* Premium Rozeti */}
          {listing.isPremium && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <Crown className="w-3 h-3" />
              {listing.planName || 'Premium'}
            </div>
          )}
          
          {/* Görüntülenme Sayısı */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {listing.views || 0} görüntülenme
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-500">{listing.location}</span>
            <span className="text-sm text-gray-500">{listing.category}</span>
          </div>
          
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
          {/* description kaldırıldı - ana sayfada gerekli değil, çok yer kaplar */}
          
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-blue-600">
              {listing.price && listing.price !== '0' ? `${listing.price} ₺` : 'Ücretsiz'}
            </span>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              İncele
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
} 
