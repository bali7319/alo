import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Star, Crown } from "lucide-react"
import { Listing } from '@/types/listings'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const [imageError, setImageError] = useState(false)

  const getDefaultImage = () => {
    return `https://picsum.photos/seed/${listing.id}/500/300`
  }

  const imageUrl = listing.images.length > 0 ? listing.images[0] : getDefaultImage();

  return (
    <Link href={`/ilan/${listing.id}`}>
      <div className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 ${
        listing.isPremium ? 'ring-2 ring-yellow-400 shadow-lg' : ''
      }`}>
        <div className="relative h-48">
          <Image
            src={imageError ? getDefaultImage() : imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized
          />
          
          {/* Premium Rozeti */}
          {listing.isPremium && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <Crown className="w-3 h-3" />
              Premium
            </div>
          )}
          
          {/* Görüntülenme Sayısı */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            0 görüntülenme
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-500">{listing.location}</span>
            <span className="text-sm text-gray-500">{listing.category}</span>
          </div>
          
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
          
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-blue-600">
              {listing.price > 0 ? `${listing.price} ₺` : 'Ücretsiz'}
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
