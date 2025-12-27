'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, Phone, Mail, Share2, Facebook, Twitter, Instagram, MessageCircle, ChevronRight, Eye, MessageSquare, AlertTriangle, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  category: string;
  subcategory: string;
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
  contactOptions?: {
    showPhone?: boolean;
    showWhatsApp?: boolean;
    showMessage?: boolean;
  };
}

interface IlanDetayClientProps {
  id: string; // Bu artık slug veya ID olabilir
}

export default function IlanDetayClient({ id }: IlanDetayClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Telefon numarasını WhatsApp formatına çevir
  const formatPhoneForWhatsApp = (phone: string): string => {
    // Boşlukları ve özel karakterleri temizle
    let cleaned = phone.replace(/\s/g, '').replace(/[()-\s]/g, '');
    
    // 0 ile başlıyorsa 90 ile değiştir (Türkiye)
    if (cleaned.startsWith('0')) {
      cleaned = '90' + cleaned.substring(1);
    }
    // Zaten 90 ile başlıyorsa olduğu gibi bırak
    else if (!cleaned.startsWith('90')) {
      cleaned = '90' + cleaned;
    }
    
    return cleaned;
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    fetchListing();
    if (session) {
      checkFavoriteStatus();
    }
  }, [id, session, status]);

  const fetchListing = async () => {
    try {
      // Slug veya ID'yi API'ye gönder
      const response = await fetch(`/api/listings/${encodeURIComponent(id)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('İlan bulunamadı');
        } else {
          setError('İlan yüklenirken bir hata oluştu');
        }
        return;
      }

      const data = await response.json();
      const listingData = data.listing;

      if (!listingData) {
        setError('İlan bulunamadı');
        return;
      }

      // Premium features'dan contactOptions'ı çıkar
      // Varsayılan olarak tüm butonlar görünür (true)
      let contactOptions = { showPhone: true, showWhatsApp: true, showMessage: true };
      if (listingData.premiumFeatures) {
        try {
          const premiumFeatures = typeof listingData.premiumFeatures === 'string' 
            ? JSON.parse(listingData.premiumFeatures) 
            : listingData.premiumFeatures;
          if (premiumFeatures && premiumFeatures.contactOptions) {
            // Premium features'dan gelen değerleri kullan, ancak undefined olanları true yap
            contactOptions = {
              showPhone: premiumFeatures.contactOptions.showPhone !== false,
              showWhatsApp: premiumFeatures.contactOptions.showWhatsApp !== false,
              showMessage: premiumFeatures.contactOptions.showMessage !== false,
            };
          }
        } catch (e) {
          console.error('Contact options parse hatası:', e);
          // Hata durumunda varsayılan değerleri kullan
          contactOptions = { showPhone: true, showWhatsApp: true, showMessage: true };
        }
      }
      
      // Eğer contactOptions hiç yoksa, varsayılan değerleri kullan
      if (!contactOptions) {
        contactOptions = { showPhone: true, showWhatsApp: true, showMessage: true };
      }

      // API'den gelen veriyi Listing formatına dönüştür
      const listing: Listing = {
        id: listingData.id,
        title: listingData.title,
        price: listingData.price,
        location: listingData.location,
        description: listingData.description,
        category: listingData.category,
        subcategory: listingData.subCategory || '',
        isPremium: listingData.isPremium || false,
        premiumUntil: listingData.premiumUntil ? new Date(listingData.premiumUntil) : null,
        features: listingData.features || [],
        images: listingData.images || [],
        seller: {
          id: listingData.user?.id || '',
          name: listingData.user?.name || 'İsimsiz',
          email: listingData.user?.email || '',
          phone: (listingData.phone || listingData.user?.phone || '').trim() // İlan telefon numarası öncelikli
        },
        createdAt: new Date(listingData.createdAt),
        views: listingData.views || 0,
        condition: listingData.condition || '',
        brand: listingData.brand || '',
        model: listingData.model || '',
        year: listingData.year || null,
        approvalStatus: listingData.approvalStatus || 'pending',
        contactOptions: contactOptions
      };

      setListing(listing);
    } catch (err) {
      console.error('İlan yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/listings/${id}/favorite`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Favori durumu kontrol hatası:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!session) {
      const currentPath = window.location.pathname;
      router.push(`/giris?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    setIsFavoriteLoading(true);
    
    try {
      if (isFavorite) {
        // Favorilerden çıkar
        const response = await fetch(`/api/listings/favorites/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsFavorite(false);
          // Başarı mesajı göster
          alert('İlan favorilerinizden çıkarıldı!');
        } else {
          const data = await response.json();
          alert(data.error || 'Favorilerden çıkarılırken bir hata oluştu.');
        }
      } else {
        // Favorilere ekle
        const response = await fetch('/api/listings/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ listingId: id }),
        });

        if (response.ok) {
          setIsFavorite(true);
          // Başarı mesajı göster
          alert('İlan favorilerinize eklendi!');
        } else {
          const data = await response.json();
          alert(data.error || 'Favorilere eklenirken bir hata oluştu.');
        }
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    if (!listing) return;

    const shareData = {
      title: listing.title,
      text: `${listing.title} - ${listing.price.toLocaleString('tr-TR')} TL`,
      url: window.location.href,
    };

    // Web Share API'yi dene (mobil cihazlarda)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
      }
    } else {
      // Fallback: Sosyal medya paylaşım linkleri
      const shareUrl = encodeURIComponent(window.location.href);
      const shareText = encodeURIComponent(`${listing.title} - ${listing.price.toLocaleString('tr-TR')} TL`);
      
      // Sosyal medya paylaşım linkleri
      const socialLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
        whatsapp: `https://wa.me/?text=${shareText}%20${shareUrl}`,
      };

      // Paylaşım menüsü göster
      const shareMenu = document.createElement('div');
      shareMenu.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      shareMenu.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 class="text-lg font-semibold mb-4">Paylaş</h3>
          <div class="space-y-3">
            <a href="${socialLinks.facebook}" target="_blank" class="flex items-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
            <a href="${socialLinks.twitter}" target="_blank" class="flex items-center p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500">
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </a>
            <a href="${socialLinks.whatsapp}" target="_blank" class="flex items-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp
            </a>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="mt-4 w-full p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Kapat
          </button>
        </div>
      `;
      
      document.body.appendChild(shareMenu);
      shareMenu.addEventListener('click', (e) => {
        if (e.target === shareMenu) {
          shareMenu.remove();
        }
      });
    }
  };

  const handleMessage = () => {
    if (!session) {
      const currentPath = window.location.pathname;
      router.push(`/giris?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }
    
    if (listing) {
      router.push(`/mesajlar/${listing.seller.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alo-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">İlan yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">İlan Bulunamadı</h2>
          <p className="text-gray-600 mb-4">{error || 'Aradığınız ilan bulunamadı.'}</p>
          <Link href="/ilanlar" className="inline-flex items-center px-4 py-2 bg-alo-orange text-white rounded-lg hover:bg-alo-dark-orange">
            Tüm İlanlara Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-4 text-sm text-gray-600">
            <Link href="/" className="hover:text-alo-orange">Ana Sayfa</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/ilanlar" className="hover:text-alo-orange">İlanlar</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/kategori/${listing.category}`} className="hover:text-alo-orange capitalize">
              {listing.category.replace('-', ' ')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">{listing.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - İlan Detayları */}
          <div className="lg:col-span-2 space-y-6">
            {/* İlan Başlığı ve Fiyat */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {listing.views} görüntülenme
                    </span>
                    <span>{listing.location}</span>
                    <span>{new Date(listing.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  {listing.isPremium && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white mb-4">
                      ⭐ Premium İlan
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-alo-orange">
                    {listing.price.toLocaleString('tr-TR')} ₺
                  </div>
                  {listing.isPremium && listing.premiumUntil && (
                    <div className="text-sm text-gray-500 mt-1">
                      Premium: {new Date(listing.premiumUntil).toLocaleDateString('tr-TR')} tarihine kadar
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resim Galerisi */}
            {listing.images && listing.images.length > 0 && listing.images[0] ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  {listing.images[0].startsWith('data:image') ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-96 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      width={800}
                      height={600}
                      className="w-full h-96 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                {listing.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {listing.images.slice(1).map((image, index) => (
                      image && image.startsWith('data:image') ? (
                        <img
                          key={index}
                          src={image}
                          alt={`${listing.title} - ${index + 2}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Image
                          key={index}
                          src={image}
                          alt={`${listing.title} - ${index + 2}`}
                          width={200}
                          height={150}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* İlan Açıklaması */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">İlan Açıklaması</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>
            </div>

            {/* İlan Özellikleri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">İlan Özellikleri</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Durum:</span>
                  <span className="font-medium">{listing.condition}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Marka:</span>
                  <span className="font-medium">{listing.brand}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-medium">{listing.model}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Yıl:</span>
                  <span className="font-medium">{listing.year}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Kategori:</span>
                  <span className="font-medium capitalize">{listing.category.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Alt Kategori:</span>
                  <span className="font-medium capitalize">{listing.subcategory.replace('-', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Premium Özellikler */}
            {listing.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Özellikler</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-alo-orange text-white"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sağ Kolon - Satıcı Bilgileri ve Aksiyonlar */}
          <div className="space-y-6">
            {/* Satıcı Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Satıcı Bilgileri</h2>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-alo-orange rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{listing.seller.name}</h3>
                  <p className="text-sm text-gray-600">{listing.location}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Telefon butonu - telefon numarası varsa ve showPhone false değilse göster */}
                {listing.seller.phone && (listing.contactOptions?.showPhone !== false) && (
                  <a
                    href={`tel:${listing.seller.phone.replace(/\s/g, '')}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    {listing.seller.phone}
                  </a>
                )}
                
                {/* WhatsApp butonu - telefon numarası varsa göster (varsayılan: göster) */}
                {listing.seller.phone && listing.seller.phone.trim() !== '' && (listing.contactOptions?.showWhatsApp !== false) && (
                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(listing.seller.phone)}?text=Merhaba, ${encodeURIComponent(listing.title)} ilanı hakkında bilgi almak istiyorum.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors"
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp ile Yaz
                  </a>
                )}
                
                {/* Mesaj butonu - varsayılan olarak göster (showMessage false değilse) */}
                {(listing.contactOptions?.showMessage !== false) && (
                  <button
                    onClick={handleMessage}
                    className="w-full flex items-center justify-center px-4 py-2 bg-alo-orange text-white rounded-lg hover:bg-alo-dark-orange transition-colors"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Mesaj Gönder
                  </button>
                )}
                
                <button
                  onClick={handleFavoriteToggle}
                  disabled={isFavoriteLoading}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    isFavorite
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavoriteLoading ? 'İşleniyor...' : isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Paylaş
                </button>
              </div>
            </div>

            {/* Güvenlik Uyarısı */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <h3 className="font-medium">Güvenlik Uyarısı</h3>
                  <p className="mt-1">
                    Alışveriş yaparken dikkatli olun. Ödeme öncesi ürünü mutlaka kontrol edin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 