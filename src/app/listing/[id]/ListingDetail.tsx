'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Thumbs } from 'swiper/modules';
import { Share2, Facebook, Twitter, MessageCircle, Instagram } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

export type Listing = {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  subCategory: string;
  description: string;
  images: string[];
  date: string;
  condition: string;
  type: string;
  status: string;
  showPhone: boolean;
  isFavorite: boolean;
  views: number;
  favorites: number;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    memberSince: string;
    location: string;
    phone: string;
  };
  premiumFeatures: {
    isFeatured: boolean;
    isUrgent: boolean;
    isVerified: boolean;
  };
};

// Örnek veri
const featuredListings: Listing[] = [
  // Elektronik - Telefon
  {
    id: '1',
    title: 'iPhone 14 Pro Max 256GB',
    price: 45000,
    location: 'Konak, İzmir',
    category: 'Elektronik',
    subCategory: 'Telefon',
    description: 'Sıfır, kutusunda iPhone 14 Pro Max 256GB. Faturalı ve garantili.',
    images: [
      'https://images.unsplash.com/photo-1678652197831-2d1808eecd76?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1678652197831-2d1808eecd76?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1678652197831-2d1808eecd76?w=800&auto=format&fit=crop&q=60'
    ],
    date: '2024-03-20',
    condition: 'Sıfır',
    type: 'Satılık',
    status: 'active',
    showPhone: false,
    isFavorite: false,
    views: 245,
    favorites: 12,
    seller: {
      id: '1',
      name: 'Ahmet Yılmaz',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60',
      rating: 4.8,
      memberSince: '2023-01-15',
      location: 'İstanbul',
      phone: ''
    },
    premiumFeatures: {
      isFeatured: true,
      isUrgent: false,
      isVerified: true
    }
  },
  // Spor - Fitness
  {
    id: '2',
    title: 'Profesyonel Fitness Ekipmanları Seti',
    price: 25000,
    location: 'Karşıyaka, İzmir',
    category: 'Spor',
    subCategory: 'Fitness',
    description: 'Tam donanımlı fitness ekipmanları seti. Dumbbell seti, bench press, squat rack ve ağırlık plakaları dahil.',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60'
    ],
    date: '2024-03-19',
    condition: 'İkinci El',
    type: 'Satılık',
    status: 'active',
    showPhone: false,
    isFavorite: false,
    views: 180,
    favorites: 8,
    seller: {
      id: '2',
      name: 'Mehmet Demir',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
      rating: 4.5,
      memberSince: '2023-03-10',
      location: 'İzmir',
      phone: ''
    },
    premiumFeatures: {
      isFeatured: false,
      isUrgent: true,
      isVerified: true
    }
  },
  // Ev & Yaşam - Mobilya
  {
    id: '3',
    title: 'Modern L Koltuk Takımı',
    price: 12000,
    location: 'Bornova, İzmir',
    category: 'Ev & Yaşam',
    subCategory: 'Mobilya',
    description: 'Yeni, kullanılmamış L koltuk takımı. Gri renk, modern tasarım. Faturalı ve garantili.',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=60'
    ],
    date: '2024-03-18',
    condition: 'Yeni',
    type: 'Satılık',
    status: 'active',
    showPhone: false,
    isFavorite: false,
    views: 320,
    favorites: 15,
    seller: {
      id: '3',
      name: 'Ayşe Kaya',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60',
      rating: 4.9,
      memberSince: '2023-02-01',
      location: 'Ankara',
      phone: ''
    },
    premiumFeatures: {
      isFeatured: true,
      isUrgent: false,
      isVerified: true
    }
  }
];

export default function ListingDetail() {
  const params = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [showPhone, setShowPhone] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params || !params.id) return;
    // URL'den ilan ID'sini al
    const listingId = params.id as string;
    // Örnek veriden ilanı bul
    const foundListing = featuredListings.find(l => l.id === listingId);
    if (foundListing) {
      setListing(foundListing);
    }
  }, [params]);

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">İlan bulunamadı</h1>
          <p className="mt-2 text-gray-600">Aradığınız ilan mevcut değil veya kaldırılmış olabilir.</p>
        </div>
      </div>
    );
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/images/placeholder.jpg';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }

    try {
      // Burada mesaj gönderme API'si çağrılacak
      // Örnek olarak başarılı gönderim simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessageSent(true);
      setMessage('');
      setSenderName('');
      setSenderEmail('');
      setShowMessageForm(false);
    } catch (err) {
      setError('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Sosyal medya paylaşım fonksiyonları
  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${listing.title} - ${listing.price.toLocaleString('tr-TR')} TL`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
  };

  const shareToTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${listing.title} - ${listing.price.toLocaleString('tr-TR')} TL`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${listing.title} - ${listing.price.toLocaleString('tr-TR')} TL`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  const shareToInstagram = () => {
    // Instagram web paylaşımı için kopyalama
    const text = `${listing.title} - ${listing.price.toLocaleString('tr-TR')} TL\n\n${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('İlan linki kopyalandı! Instagram\'da paylaşabilirsiniz.');
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('İlan linki kopyalandı!');
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* İlan Başlığı ve Fiyat */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-semibold text-primary">
            {listing.price.toLocaleString('tr-TR')} TL
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {listing.views} görüntülenme
            </span>
            <button
              className={`flex items-center space-x-1 ${
                listing.isFavorite ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={listing.isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{listing.favorites}</span>
            </button>
          </div>
        </div>
        
        {/* Sosyal Medya Paylaşım Butonları */}
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-sm text-gray-600">Paylaş:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={shareToFacebook}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              title="Facebook'ta Paylaş"
            >
              <Facebook className="w-4 h-4" />
            </button>
            <button
              onClick={shareToTwitter}
              className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
              title="Twitter'da Paylaş"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={shareToWhatsApp}
              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              title="WhatsApp'ta Paylaş"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={shareToInstagram}
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
              title="Instagram'da Paylaş"
            >
              <Instagram className="w-4 h-4" />
            </button>
            <button
              onClick={copyLink}
              className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
              title="Linki Kopyala"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* İlan Detayları Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon - Resimler */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Swiper
              modules={[Navigation, Pagination, Autoplay, Thumbs]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              thumbs={{ swiper: thumbsSwiper }}
              className="h-[400px]"
            >
              {listing.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={`${listing.title} - Resim ${index + 1}`}
                      fill
                      className="object-contain"
                      onError={handleImageError}
                      priority={index === 0}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Küçük Resimler */}
            <Swiper
              modules={[Thumbs]}
              watchSlidesProgress
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={5}
              className="h-20 mt-2"
            >
              {listing.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full cursor-pointer">
                    <Image
                      src={image}
                      alt={`${listing.title} - Küçük Resim ${index + 1}`}
                      fill
                      className="object-cover rounded"
                      onError={handleImageError}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Sağ Kolon - Satıcı Bilgileri */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative w-16 h-16">
                <Image
                  src={listing.seller.avatar}
                  alt={listing.seller.name}
                  fill
                  className="rounded-full object-cover"
                  onError={handleImageError}
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{listing.seller.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {listing.seller.rating}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{listing.seller.memberSince}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Konum:</span>
                <span className="font-medium">{listing.seller.location}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Üyelik:</span>
                <span className="font-medium">{listing.seller.memberSince}</span>
              </div>
              {listing.showPhone && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Telefon:</span>
                  {showPhone ? (
                    <span className="font-medium">{listing.seller.phone}</span>
                  ) : (
                    <button
                      onClick={() => setShowPhone(true)}
                      className="text-primary hover:text-primary-dark"
                    >
                      Telefonu Göster
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {!showMessageForm ? (
                <button
                  onClick={() => setShowMessageForm(true)}
                  className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Mesaj Gönder
                </button>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                  {messageSent && (
                    <div className="text-green-500 text-sm">Mesajınız başarıyla gönderildi.</div>
                  )}
                  <div>
                    <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
                      Adınız Soyadınız
                    </label>
                    <input
                      type="text"
                      id="senderName"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                  <div>
                    <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta Adresiniz
                    </label>
                    <input
                      type="email"
                      id="senderEmail"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="ornek@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Mesajınız
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="İlan sahibine mesajınızı yazın..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Gönder
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMessageForm(false);
                        setError('');
                        setMessageSent(false);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* İlan Açıklaması */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">İlan Açıklaması</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
        </div>
      </div>

      {/* İlan Detayları */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">İlan Detayları</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-600">Kategori</span>
            <p className="font-medium">{listing.category}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Alt Kategori</span>
            <p className="font-medium">{listing.subCategory}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Durum</span>
            <p className="font-medium">{listing.condition}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">İlan Tarihi</span>
            <p className="font-medium">{listing.date}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 