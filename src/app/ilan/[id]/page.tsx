'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, Phone, Mail, Share2, Facebook, Twitter, Instagram, MessageCircle, ChevronRight, Eye, MessageSquare, AlertTriangle, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Hw7Zyc2VsIFlvayA8L3RleHQ+PC9zdmc+';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  category: string;
  subCategory: string;
  isPremium: boolean;
  premiumUntil: Date | null;
  features: string[];
  images: string[];
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt: Date;
  views: number;
  condition: string;
  brand: string;
  model: string;
  year: number;
  approvalStatus: string;
}

export default function IlanDetayPage() {
  const params = useParams();
  const listingId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/listings/${listingId}`);
        
        if (!response.ok) {
          throw new Error('İlan bulunamadı');
        }
        
        const data = await response.json();
        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  useEffect(() => {
    if (listing) {
      const likedListings = JSON.parse(localStorage.getItem('likedListings') || '[]');
      setIsLiked(likedListings.includes(listing.id));
    }
  }, [listing]);

  const handleLike = () => {
    if (!listing) return;

    const likedListings = JSON.parse(localStorage.getItem('likedListings') || '[]');
    let newLikedListings;

    if (isLiked) {
      newLikedListings = likedListings.filter((id: string) => id !== listing.id);
    } else {
      newLikedListings = [...likedListings, listing.id];
    }

    localStorage.setItem('likedListings', JSON.stringify(newLikedListings));
    setIsLiked(!isLiked);
  };

  const handleContact = () => {
    if (!session) {
      return;
    }
    setShowContact(!showContact);
  };

  const handleShare = (platform: string) => {
    if (!listing) return;

    const shareUrl = window.location.href;
    const shareText = `${listing.title} - ${listing.price} TL`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'instagram':
        window.open('https://www.instagram.com', '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
        break;
    }
    setShowShareMenu(false);
  };

  const getDefaultImage = () => {
    if (!listing) return placeholderImage;
    return `https://picsum.photos/seed/${listing.id}/500/300`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">İlan yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">İlan bulunamadı</h1>
          <p className="text-gray-600 mb-4">{error || 'Aradığınız ilan mevcut değil.'}</p>
          <Link 
            href="/" 
            className="inline-block bg-alo-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // İlan onaylanmamışsa gösterme
  if (listing.approvalStatus !== 'approved') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">İlan henüz onaylanmamış</h1>
          <p className="text-gray-600 mb-4">Bu ilan henüz moderatör tarafından onaylanmamıştır.</p>
          <Link 
            href="/" 
            className="inline-block bg-alo-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // İlan detayında images'ı parse et
  const images = Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images || "[]");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-alo-orange">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href={`/kategori/${listing.category.toLowerCase()}`} className="text-gray-700 hover:text-alo-orange">
                {listing.category}
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{listing.title}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon - İlan Detayları */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* İlan Başlığı ve Fiyat */}
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{listing.title}</h1>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold text-blue-600">{listing.price} TL</span>
                <span className="text-sm text-gray-500">{listing.location}</span>
              </div>
            </div>

            {/* İlan Görselleri */}
            <div className="p-6 border-b">
              <div className="relative h-[500px] mb-4">
                <Image
                  src={imageError ? getDefaultImage() : (images[selectedImage] || getDefaultImage())}
                  alt={listing.title}
                  fill
                  className="object-contain rounded-lg"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              </div>
              {images && images.length > 1 && (
                <div className="grid grid-cols-5 gap-4">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`border-2 rounded-md overflow-hidden focus:outline-none ${selectedImage === index ? 'border-blue-600' : 'border-transparent'}`}
                    >
                      <img
                        src={image}
                        alt={`Resim ${index + 1}`}
                        className="w-full h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* İlan Detayları */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-4">İlan Detayları</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Kategori</p>
                  <p className="font-medium">{listing.category}</p>
                </div>
                <div>
                  <p className="text-gray-600">Alt Kategori</p>
                  <p className="font-medium">{listing.subCategory}</p>
                </div>
                <div>
                  <p className="text-gray-600">Durum</p>
                  <p className="font-medium">{listing.condition}</p>
                </div>
                <div>
                  <p className="text-gray-600">Marka</p>
                  <p className="font-medium">{listing.brand}</p>
                </div>
                <div>
                  <p className="text-gray-600">Model</p>
                  <p className="font-medium">{listing.model}</p>
                </div>
                <div>
                  <p className="text-gray-600">Yıl</p>
                  <p className="font-medium">{listing.year}</p>
                </div>
              </div>
            </div>

            {/* İlan Açıklaması */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-4">İlan Açıklaması</h2>
              <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Satıcı Bilgileri ve Butonlar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">{listing.seller.name}</p>
                  <p className="text-sm text-gray-500">{listing.location}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{listing.seller.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{listing.seller.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{listing.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">
                    {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-colors ${
                      isLiked 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{isLiked ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>İlanı Paylaş</span>
                    </button>
                    {showShareMenu && (
                      <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-10 min-w-[200px]">
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => handleShare('facebook')}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors p-2 rounded hover:bg-blue-50"
                          >
                            <Facebook className="w-5 h-5" />
                            <span>Facebook</span>
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="flex items-center space-x-2 text-blue-400 hover:text-blue-500 transition-colors p-2 rounded hover:bg-blue-50"
                          >
                            <Twitter className="w-5 h-5" />
                            <span>Twitter</span>
                          </button>
                          <button
                            onClick={() => handleShare('instagram')}
                            className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors p-2 rounded hover:bg-pink-50"
                          >
                            <Instagram className="w-5 h-5" />
                            <span>Instagram</span>
                          </button>
                          <button
                            onClick={() => handleShare('whatsapp')}
                            className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors p-2 rounded hover:bg-green-50"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mesaj Butonu */}
                <Link 
                  href={`/mesajlar/${listing.seller.id}?ilan=${listing.id}`}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Satıcıya Mesaj Gönder</span>
                </Link>

                <Link 
                  href={`/ilan/${listingId}/sikayet`}
                  className="w-full flex items-center justify-between px-4 py-3 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition-colors"
                >
                  <span>İlanı Bildir</span>
                  <AlertTriangle className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 