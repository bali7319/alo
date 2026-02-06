'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, Phone, Mail, Share2, Facebook, Twitter, Instagram, MessageCircle, ChevronLeft, ChevronRight, Eye, MessageSquare, AlertTriangle, User, Flag, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AutoLinkText } from '@/components/seo/AutoLinkText';
import { categories } from '@/lib/categories';

const FALLBACK_IMAGE_SRC = '/images/logo.svg';

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
  showPhone?: boolean;
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  createdAt: Date;
  views?: number;
  condition: string;
  brand: string;
  approvalStatus: string;
  contactOptions?: {
    showPhone?: boolean;
    showWhatsApp?: boolean;
    showMessage?: boolean;
  };
}

interface IlanDetayClientProps {
  id: string; // Bu artık slug veya ID olabilir
  seo?: {
    internalLinking: boolean;
    linkTracking: boolean;
  };
}

export default function IlanDetayClient({ id, seo }: IlanDetayClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [isRevealingPhone, setIsRevealingPhone] = useState(false);

  const categoryHref = useMemo(() => {
    const raw = listing?.category;
    if (!raw) return '/kategoriler';

    const match = categories.find(
      (c) =>
        c.slug === raw ||
        c.name.toLocaleLowerCase('tr-TR') === raw.toLocaleLowerCase('tr-TR')
    );

    const slug = match?.slug ?? encodeURIComponent(raw);
    return `/kategori/${slug}`;
  }, [listing?.category]);

  // Mobil sekmeler (arabam.com benzeri)
  const [mobileTab, setMobileTab] = useState<'info' | 'desc' | 'services'>('info');
  const infoRef = useRef<HTMLDivElement | null>(null);
  const descRef = useRef<HTMLDivElement | null>(null);
  const servicesRef = useRef<HTMLDivElement | null>(null);
  const mobileGalleryRef = useRef<HTMLDivElement | null>(null);

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

  // Güvenli resim parse fonksiyonu - Base64 kontrolü ile
  const parseImages = (images: any): string[] => {
    if (!images) return [];
    
    // Zaten array ise direkt döndür
    if (Array.isArray(images)) {
      return images;
    }
    
    // Base64 resim kontrolü - eğer veri zaten Base64 resim ise parse etme
    if (typeof images === 'string' && images.startsWith('data:image')) {
      return [images];
    }
    
    // JSON parse denemesi - sadece JSON formatında ise
    if (typeof images === 'string' && (images.startsWith('[') || images.startsWith('{'))) {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) return parsed;
        return parsed ? [parsed] : [];
      } catch (e) {
        console.error('JSON Parse Hatası:', e);
        // JSON parse başarısız - string olarak döndür
        return [images];
      }
    }
    
    // Diğer durumlarda string olarak döndür
    return typeof images === 'string' ? [images] : [];
  };

  // Mobil galeri için kesin array (API bazen string/JSON döndürebiliyor)
  const mobileGalleryImages = useMemo(() => {
    const imgs = parseImages((listing as any)?.images).filter(Boolean);
    return imgs.length > 0 ? imgs : [FALLBACK_IMAGE_SRC];
  }, [listing?.images]);

  useEffect(() => {
    if (status === 'loading') return;
    
    fetchListing();
  }, [id, status]);

  useEffect(() => {
    if (session && listing) {
      checkFavoriteStatus();
    }
  }, [session, listing]);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Slug veya ID'yi API'ye gönder
      const response = await fetch(`/api/listings/${encodeURIComponent(id)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        if (response.status === 404) {
          setError('İlan bulunamadı');
        } else {
          setError(errorData.error || 'İlan yüklenirken bir hata oluştu');
        }
        return;
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      const listingData = data.listing;

      if (!listingData) {
        console.error('Listing data is missing:', data);
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
        images: parseImages(listingData.images),
        showPhone: listingData.showPhone !== false,
        seller: {
          id: listingData.user?.id || '',
          name: listingData.user?.name || 'İsimsiz',
          email: listingData.user?.email || '',
          // Telefon bilgisi public response'ta dönmüyor; kullanıcı aksiyonu ile reveal edilir.
          phone: (listingData.phone || listingData.user?.phone || '').trim() || null
        },
        createdAt: new Date(listingData.createdAt),
        views: typeof listingData.views === 'number' ? listingData.views : undefined,
        condition: listingData.condition || '',
        brand: listingData.brand || '',
        approvalStatus: listingData.approvalStatus || 'pending',
        contactOptions: contactOptions
      };

      setListing(listing);
      setSelectedImageIndex(0);
      console.log('Listing set successfully:', listing);
    } catch (err) {
      console.error('İlan yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!listing) return; // Listing yüklenmeden favori kontrolü yapma
    
    try {
      const response = await fetch(`/api/listings/${listing.id}/favorite`);
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

    if (!listing) {
      alert('İlan bilgisi yüklenemedi. Lütfen sayfayı yenileyin.');
      return;
    }

    setIsFavoriteLoading(true);
    
    try {
      if (isFavorite) {
        // Favorilerden çıkar
        const response = await fetch(`/api/listings/favorites/${listing.id}`, {
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
          body: JSON.stringify({ listingId: listing.id }),
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

  const scrollToMobileSection = (tab: 'info' | 'desc' | 'services') => {
    setMobileTab(tab);
    const el =
      tab === 'info' ? infoRef.current :
      tab === 'desc' ? descRef.current :
      servicesRef.current;
    // Sticky tab bar için biraz üst boşluk bırak
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleMobileGalleryScroll = () => {
    const el = mobileGalleryRef.current;
    if (!el) return;
    const width = el.clientWidth || 1;
    const raw = Math.round(el.scrollLeft / width);
    const total = mobileGalleryImages.length;
    const next = Math.max(0, Math.min(raw, Math.max(0, total - 1)));
    if (next !== selectedImageIndex) setSelectedImageIndex(next);
  };

  const scrollMobileGalleryToIndex = (index: number) => {
    const el = mobileGalleryRef.current;
    if (!el) return;
    const width = el.clientWidth || 1;
    el.scrollTo({ left: index * width, behavior: 'smooth' });
    setSelectedImageIndex(index);
  };

  const actionButtons = useMemo(() => {
    const phone = (listing?.seller.phone || '').trim();
    const canRevealPhone =
      (listing?.showPhone !== false) && (listing?.contactOptions?.showPhone !== false);
    const canRevealWhatsApp =
      (listing?.showPhone !== false) && (listing?.contactOptions?.showWhatsApp !== false);
    const showPhone = Boolean(phone) && canRevealPhone;
    const showWhatsApp = Boolean(phone) && canRevealWhatsApp;
    const showMessage = (listing?.contactOptions?.showMessage !== false);
    return { phone, canRevealPhone, canRevealWhatsApp, showPhone, showWhatsApp, showMessage };
  }, [listing]);

  const revealPhone = async (): Promise<string | null> => {
    if (!listing) return null;
    const existing = (listing.seller.phone || '').trim();
    if (existing) return existing;

    if (isRevealingPhone) return null;
    setIsRevealingPhone(true);
    try {
      const res = await fetch(`/api/listings/${encodeURIComponent(listing.id)}/reveal-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Telefon bilgisi alınamadı');
      }
      const data = await res.json().catch(() => null);
      const phone = (data?.phone || '').toString().trim();
      if (!phone) throw new Error('Telefon bilgisi alınamadı');

      setListing((prev) =>
        prev
          ? {
              ...prev,
              seller: {
                ...prev.seller,
                phone,
              },
            }
          : prev
      );
      return phone;
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Telefon bilgisi alınamadı');
      return null;
    } finally {
      setIsRevealingPhone(false);
    }
  };

  const handleCallClick = async (e: React.MouseEvent) => {
    if (!listing) return;
    if (actionButtons.phone) return; // anchor zaten tel: ile gidecek
    e.preventDefault();
    const phone = await revealPhone();
    if (phone) {
      window.location.href = `tel:${phone.replace(/\s/g, '')}`;
    }
  };

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    if (!listing) return;
    if (actionButtons.phone) return; // anchor zaten WA'ya gidecek
    e.preventDefault();
    const phone = await revealPhone();
    if (phone) {
      const url = `https://wa.me/${formatPhoneForWhatsApp(phone)}?text=Merhaba, ${encodeURIComponent(
        listing.title
      )} ilanı hakkında bilgi almak istiyorum.`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getDirectionsUrl = (address: string) => {
    const destination = encodeURIComponent(address);
    // origin verilmezse çoğu cihaz mevcut konumdan yol tarifi açar.
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  };

  const getDirectionsUrlForDevice = (address: string) => {
    const destination = encodeURIComponent(address);
    // iOS'ta Apple Maps daha iyi UX (harita uygulamasını direkt açar)
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      const isIOS = /iPad|iPhone|iPod/i.test(ua);
      if (isIOS) {
        return `https://maps.apple.com/?daddr=${destination}&dirflg=d`;
      }
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  };

  const handleDirectionsClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    address: string
  ) => {
    // Some environments (PWA/standalone WebView) may ignore target="_blank".
    // Force opening a new tab/window.
    e.preventDefault();
    const url = getDirectionsUrlForDevice(address);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleReport = async () => {
    if (!session) {
      const currentPath = window.location.pathname;
      router.push(`/giris?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!listing || !reportReason) {
      alert('Lütfen şikayet nedenini seçin');
      return;
    }

    setIsReporting(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          reason: reportReason,
          description: reportDescription || null,
        }),
      });

      if (response.ok) {
        alert('Şikayetiniz başarıyla gönderildi. İnceleme sürecine alındı.');
        setShowReportDialog(false);
        setReportReason('');
        setReportDescription('');
      } else {
        const data = await response.json();
        alert(data.error || 'Şikayet gönderilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Şikayet gönderme hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsReporting(false);
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
      {/* Mobil layout */}
      <div className="md:hidden">
        {/* Breadcrumb (mobil) */}
        <div className="bg-white border-b">
          <div className="px-3">
            <nav aria-label="Breadcrumb" className="py-2">
              <ol className="flex flex-nowrap items-center gap-x-2 overflow-x-auto text-[12px] text-gray-600 leading-none">
                <li className="shrink-0">
                  <Link href="/" className="hover:text-alo-orange whitespace-nowrap">Ana Sayfa</Link>
                </li>
                <li aria-hidden="true" className="shrink-0 text-gray-400">›</li>
                <li className="shrink-0">
                  <Link href="/ilanlar" className="hover:text-alo-orange whitespace-nowrap">İlanlar</Link>
                </li>
                <li aria-hidden="true" className="shrink-0 text-gray-400">›</li>
                <li className="shrink-0">
                  <Link href={categoryHref} className="hover:text-alo-orange capitalize whitespace-nowrap">
                    {listing.category}
                  </Link>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Galeri */}
        <div className="bg-black">
          <div className="relative">
            {(() => {
              const total = mobileGalleryImages.length;
              const prevDisabled = selectedImageIndex <= 0;
              const nextDisabled = selectedImageIndex >= total - 1;

              // Mobile overlay arrows (transparent)
              return total > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => scrollMobileGalleryToIndex(Math.max(0, selectedImageIndex - 1))}
                    disabled={prevDisabled}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 z-30 pointer-events-auto rounded-full bg-black/50 backdrop-blur-sm p-2 text-white shadow-lg ring-1 ring-white/30 transition ${
                      prevDisabled ? 'opacity-30' : 'hover:bg-black/35 active:scale-95'
                    }`}
                    aria-label="Önceki fotoğraf"
                  >
                    <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollMobileGalleryToIndex(Math.min(total - 1, selectedImageIndex + 1))}
                    disabled={nextDisabled}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 z-30 pointer-events-auto rounded-full bg-black/50 backdrop-blur-sm p-2 text-white shadow-lg ring-1 ring-white/30 transition ${
                      nextDisabled ? 'opacity-30' : 'hover:bg-black/35 active:scale-95'
                    }`}
                    aria-label="Sonraki fotoğraf"
                  >
                    <ChevronRight className="h-6 w-6" aria-hidden="true" />
                  </button>
                </>
              ) : null;
            })()}

            <div
              ref={mobileGalleryRef}
              onScroll={handleMobileGalleryScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {mobileGalleryImages.map((img, idx) => {
                const src = img || FALLBACK_IMAGE_SRC;
                return (
                  <div
                    key={idx}
                    className="relative w-full shrink-0 snap-center aspect-[4/3] overflow-hidden border-2 border-alo-orange"
                  >
                    {src.startsWith('data:image') ? (
                      <img
                        src={src}
                        alt={listing.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE_SRC;
                        }}
                      />
                    ) : (
                      <Image
                        src={src}
                        alt={listing.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        onError={(e) => {
                          (e.target as unknown as HTMLImageElement).src = FALLBACK_IMAGE_SRC;
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sayaç */}
            {mobileGalleryImages.length > 1 && (
              <div className="absolute left-3 bottom-3 rounded bg-black/60 text-white text-xs px-2 py-1">
                {Math.min(selectedImageIndex + 1, mobileGalleryImages.length)} / {mobileGalleryImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Başlık / Konum / Fiyat */}
        <div className="bg-white px-3 py-3">
          <h1 className="text-[18px] font-bold text-gray-900 leading-snug">{listing.title}</h1>
          {listing.location ? (
            <a
              href={getDirectionsUrlForDevice(listing.location)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleDirectionsClick(e, listing.location)}
              className="mt-2 flex items-start gap-2 text-sm text-gray-600 hover:text-alo-orange min-w-0"
              aria-label="Adrese git (yol tarifi)"
              title="Adrese git (yol tarifi)"
            >
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate underline-offset-4 hover:underline">{listing.location}</span>
            </a>
          ) : null}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-3xl font-extrabold text-alo-red">
              {listing.price.toLocaleString('tr-TR')} TL
            </div>
            <div className="text-xs text-gray-500">
              {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
            </div>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="sticky top-14 z-40 bg-white border-b">
          <div className="px-3">
            <div className="flex gap-5 text-sm font-medium">
              <button
                type="button"
                onClick={() => scrollToMobileSection('info')}
                className={`py-3 ${mobileTab === 'info' ? 'text-alo-orange border-b-2 border-alo-orange' : 'text-gray-700'}`}
              >
                İlan bilgileri
              </button>
              <button
                type="button"
                onClick={() => scrollToMobileSection('desc')}
                className={`py-3 ${mobileTab === 'desc' ? 'text-alo-orange border-b-2 border-alo-orange' : 'text-gray-700'}`}
              >
                Açıklama
              </button>
              <button
                type="button"
                onClick={() => scrollToMobileSection('services')}
                className={`py-3 ${mobileTab === 'services' ? 'text-alo-orange border-b-2 border-alo-orange' : 'text-gray-700'}`}
              >
                Hizmetler
              </button>
            </div>
          </div>
        </div>

        {/* İçerik (CTA bar için alt padding) */}
        <div className="pb-24">
          {/* İlan bilgileri */}
          <div ref={infoRef} className="bg-white mt-2">
            <div className="px-3 py-3 border-b text-sm font-semibold text-gray-900">İlan bilgileri</div>
            <div className="divide-y text-sm">
              <div className="flex justify-between px-3 py-3">
                <span className="text-gray-600">Kategori</span>
                <span className="font-medium capitalize">{listing.category.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between px-3 py-3">
                <span className="text-gray-600">Alt kategori</span>
                <span className="font-medium capitalize">{listing.subcategory?.replace('-', ' ') || '-'}</span>
              </div>
              <div className="flex justify-between px-3 py-3">
                <span className="text-gray-600">Durum</span>
                <span className="font-medium">{listing.condition || '-'}</span>
              </div>
              <div className="flex justify-between px-3 py-3">
                <span className="text-gray-600">Marka</span>
                <span className="font-medium">{listing.brand || '-'}</span>
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div ref={descRef} className="bg-white mt-2">
            <div className="px-3 py-3 border-b text-sm font-semibold text-gray-900">Açıklama</div>
            <div className="px-3 py-3 text-sm text-gray-700 whitespace-pre-line">
              <AutoLinkText
                text={listing.description}
                listingId={listing.id}
                source="listing_description"
                enableInternalLinking={seo?.internalLinking ?? true}
                enableLinkTracking={seo?.linkTracking ?? false}
              />
            </div>
          </div>

          {/* Hizmetler / Özellikler */}
          <div ref={servicesRef} className="bg-white mt-2">
            <div className="px-3 py-3 border-b text-sm font-semibold text-gray-900">Hizmetler</div>
            <div className="px-3 py-3">
              {listing.features.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {listing.features.map((f, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                      {f}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600">Bu ilan için ek özellik belirtilmemiş.</div>
              )}
            </div>

            <div className="px-3 pb-4 space-y-2">
              <button
                type="button"
                onClick={() => setShowReportDialog(true)}
                className="w-full rounded-lg border border-gray-200 py-3 text-sm text-gray-800 flex items-center justify-center gap-2"
              >
                <Flag className="h-4 w-4" />
                Şikayet et
              </button>

              <button
                type="button"
                onClick={handleFavoriteToggle}
                disabled={isFavoriteLoading}
                className={`w-full rounded-lg border py-3 text-sm flex items-center justify-center gap-2 ${
                  isFavorite ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 text-gray-800'
                } ${isFavoriteLoading ? 'opacity-60' : ''}`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavoriteLoading ? 'İşleniyor...' : isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              </button>

              <div className="grid grid-cols-3 gap-2">
                {(() => {
                  const href = typeof window !== 'undefined' ? window.location.href : '';
                  const shareUrl = encodeURIComponent(href);
                  const shareText = encodeURIComponent(`${listing.title} - ${listing.price.toLocaleString('tr-TR')} TL`);
                  return (
                    <>
                      <a
                        href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-11 rounded-lg bg-[#25D366] text-white flex items-center justify-center gap-2 text-sm font-semibold"
                        aria-label="WhatsApp ile paylaş"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-11 rounded-lg bg-[#1877F2] text-white flex items-center justify-center gap-2 text-sm font-semibold"
                        aria-label="Facebook'ta paylaş"
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-11 rounded-lg bg-black text-white flex items-center justify-center gap-2 text-sm font-semibold"
                        aria-label="X'te paylaş"
                      >
                        <Twitter className="h-4 w-4" />
                        X
                      </a>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Sabit CTA bar */}
        {(actionButtons.canRevealPhone || actionButtons.showMessage || actionButtons.canRevealWhatsApp) && (
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t">
            <div className="px-3 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
              <div className="grid grid-cols-3 gap-2">
                {/* Ara */}
                <a
                  href={
                    actionButtons.phone
                      ? `tel:${actionButtons.phone.replace(/\s/g, '')}`
                      : '#'
                  }
                  onClick={(e) => {
                    if (!actionButtons.canRevealPhone) {
                      e.preventDefault();
                      return;
                    }
                    // Phone yoksa reveal et, sonra ara
                    if (!actionButtons.phone) {
                      void handleCallClick(e);
                    }
                  }}
                  className={`h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-sm active:scale-[0.99] transition ${
                    actionButtons.canRevealPhone
                      ? 'bg-alo-orange text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-300'
                  }`}
                  aria-disabled={!actionButtons.canRevealPhone}
                >
                  <Phone className="h-4 w-4" />
                  {actionButtons.phone ? 'Ara' : isRevealingPhone ? 'Yükleniyor...' : 'Telefonu göster'}
                </a>

                {/* Mesaj */}
                <button
                  type="button"
                  onClick={() => actionButtons.showMessage && handleMessage()}
                  disabled={!actionButtons.showMessage}
                  className={`h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold ${
                    actionButtons.showMessage ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Mesaj gönder
                </button>

                {/* WhatsApp */}
                <a
                  href={
                    actionButtons.phone
                      ? `https://wa.me/${formatPhoneForWhatsApp(actionButtons.phone)}?text=Merhaba, ${encodeURIComponent(
                          listing.title
                        )} ilanı hakkında bilgi almak istiyorum.`
                      : '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!actionButtons.canRevealWhatsApp) {
                      e.preventDefault();
                      return;
                    }
                    if (!actionButtons.phone) {
                      void handleWhatsAppClick(e);
                    }
                  }}
                  className={`h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold ${
                    actionButtons.canRevealWhatsApp ? 'bg-[#25D366] text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                  aria-disabled={!actionButtons.canRevealWhatsApp}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Şikayet Dialog (mobil) */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>İlanı Bildir</DialogTitle>
              <DialogDescription>
                Bu ilanı neden bildirmek istiyorsunuz? Şikayetiniz incelenecektir.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şikayet Nedeni <span className="text-red-500">*</span>
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-alo-orange"
                  required
                >
                  <option value="">Seçiniz...</option>
                  <option value="spam">Spam / Gereksiz İçerik</option>
                  <option value="inappropriate">Uygunsuz İçerik</option>
                  <option value="fake">Sahte / Yanıltıcı İlan</option>
                  <option value="duplicate">Tekrar Eden İlan</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama (Opsiyonel)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-alo-orange"
                  placeholder="Şikayetiniz hakkında daha fazla bilgi verin..."
                />
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason('');
                  setReportDescription('');
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isReporting}
              >
                İptal
              </button>
              <button
                onClick={handleReport}
                disabled={isReporting || !reportReason}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReporting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop layout (mevcut) */}
      <div className="hidden md:block">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            <nav aria-label="Breadcrumb" className="py-3 sm:py-4">
              <ol className="flex flex-nowrap items-center gap-x-1 sm:gap-x-2 overflow-x-auto text-xs sm:text-sm text-gray-600 leading-4 sm:leading-none">
                <li className="inline-flex items-center leading-none shrink-0">
                  <Link href="/" className="inline-flex items-center leading-none hover:text-alo-orange whitespace-nowrap">
                    Ana Sayfa
                  </Link>
                </li>
                <li aria-hidden="true" className="inline-flex items-center leading-none shrink-0">
                  <span className="text-gray-400 select-none leading-none">›</span>
                </li>
                <li className="inline-flex items-center leading-none shrink-0">
                  <Link href="/ilanlar" className="inline-flex items-center leading-none hover:text-alo-orange whitespace-nowrap">
                    İlanlar
                  </Link>
                </li>
                <li aria-hidden="true" className="inline-flex items-center leading-none shrink-0">
                  <span className="text-gray-400 select-none leading-none">›</span>
                </li>
                <li className="inline-flex items-center leading-none shrink-0">
                  <Link
                    href={categoryHref}
                    className="inline-flex items-center leading-none hover:text-alo-orange capitalize whitespace-nowrap"
                  >
                    {listing.category}
                  </Link>
                </li>
                <li aria-hidden="true" className="inline-flex items-center leading-none shrink-0">
                  <span className="text-gray-400 select-none leading-none">›</span>
                </li>
                <li className="inline-flex items-center leading-none text-gray-900 min-w-0">
                  <span className="inline-flex items-center leading-none truncate max-w-[60vw] sm:max-w-none">
                    {listing.title}
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Sol Kolon - İlan Detayları */}
            <div className="lg:col-span-2 space-y-6">
            {/* İlan Başlığı ve Fiyat */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    {typeof listing.views === 'number' && (
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {listing.views} görüntülenme
                      </span>
                    )}
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
                <div className="relative w-full mb-4 border-2 border-alo-orange rounded-lg overflow-hidden bg-gray-100">
                  {listing.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedImageIndex((i) => Math.max(0, i - 1))}
                        disabled={selectedImageIndex <= 0}
                        className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-white/95 hover:bg-white text-gray-800 shadow-xl border border-gray-200 transition-all duration-200 ${
                          selectedImageIndex <= 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
                        }`}
                        aria-label="Önceki fotoğraf"
                      >
                        <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex((i) => Math.min(Math.max(0, listing.images.length - 1), i + 1))
                        }
                        disabled={selectedImageIndex >= listing.images.length - 1}
                        className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-white/95 hover:bg-white text-gray-800 shadow-xl border border-gray-200 transition-all duration-200 ${
                          selectedImageIndex >= listing.images.length - 1
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:scale-110 active:scale-95'
                        }`}
                        aria-label="Sonraki fotoğraf"
                      >
                        <ChevronRight className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
                      </button>
                    </>
                  )}
                  {(() => {
                    const selected = listing.images[selectedImageIndex] || listing.images[0];
                    const src = selected || FALLBACK_IMAGE_SRC;
                    if (src.startsWith('data:image')) {
                      return (
                        <img
                          src={src}
                          alt={listing.title}
                          className="w-full h-96 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_IMAGE_SRC;
                          }}
                        />
                      );
                    }
                    return (
                      <Image
                        src={src}
                        alt={listing.title}
                        width={800}
                        height={600}
                        className="w-full h-96 object-cover"
                        onError={(e) => {
                          const img = e.target as unknown as HTMLImageElement;
                          img.src = FALLBACK_IMAGE_SRC;
                        }}
                      />
                    );
                  })()}
                </div>
                {listing.images.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                    {listing.images.map((image, index) => (
                      image && image.startsWith('data:image') ? (
                        <img
                          key={index}
                          src={image}
                          alt={`${listing.title} - görsel ${index + 1}`}
                          className={`w-full h-16 sm:h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 border-2 border-alo-orange ${index === selectedImageIndex ? 'ring-2 ring-alo-orange' : ''}`}
                          onClick={() => setSelectedImageIndex(index)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_IMAGE_SRC;
                          }}
                        />
                      ) : (
                        <Image
                          key={index}
                          src={image || FALLBACK_IMAGE_SRC}
                          alt={`${listing.title} - görsel ${index + 1}`}
                          width={200}
                          height={150}
                          className={`w-full h-16 sm:h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 border-2 border-alo-orange ${index === selectedImageIndex ? 'ring-2 ring-alo-orange' : ''}`}
                          onClick={() => setSelectedImageIndex(index)}
                          onError={(e) => {
                            const img = e.target as unknown as HTMLImageElement;
                            img.src = FALLBACK_IMAGE_SRC;
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
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  <AutoLinkText
                    text={listing.description}
                    listingId={listing.id}
                    source="listing_description"
                    enableInternalLinking={seo?.internalLinking ?? true}
                    enableLinkTracking={seo?.linkTracking ?? false}
                  />
                </p>
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
                  {listing.location ? (
                    <a
                      href={getDirectionsUrlForDevice(listing.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleDirectionsClick(e, listing.location)}
                      className="text-sm text-gray-600 hover:text-alo-orange underline-offset-4 hover:underline"
                      aria-label="Haritalarda yol tarifi al"
                      title="Haritalarda yol tarifi al"
                    >
                      {listing.location}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-600">-</p>
                  )}
                </div>
              </div>

              {/* Mobilde link tıklaması sorun çıkarabiliyor: buton ekle */}
              {listing.location && (
                <div className="mt-3">
                  <a
                    href={getDirectionsUrlForDevice(listing.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleDirectionsClick(e, listing.location)}
                    className="w-full inline-flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Adrese git (yol tarifi)"
                    title="Adrese git (yol tarifi)"
                  >
                    Adrese Git
                  </a>
                </div>
              )}
              
              <div className="space-y-2">
                {/* Telefon butonu - telefon numarası varsa ve showPhone false değilse göster */}
                {(listing.showPhone !== false) && (listing.contactOptions?.showPhone !== false) && (
                  <a
                    href={listing.seller.phone ? `tel:${listing.seller.phone.replace(/\s/g, '')}` : '#'}
                    onClick={handleCallClick}
                    className="w-full flex items-center justify-center px-2 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Phone className="h-3 w-3 mr-1.5" />
                    {listing.seller.phone ? listing.seller.phone : isRevealingPhone ? 'Yükleniyor...' : 'Telefonu göster'}
                  </a>
                )}
                
                {/* WhatsApp butonu - telefon numarası varsa göster (varsayılan: göster) */}
                {(listing.showPhone !== false) && (listing.contactOptions?.showWhatsApp !== false) && (
                  <a
                    href={
                      listing.seller.phone
                        ? `https://wa.me/${formatPhoneForWhatsApp(listing.seller.phone)}?text=Merhaba, ${encodeURIComponent(
                            listing.title
                          )} ilanı hakkında bilgi almak istiyorum.`
                        : '#'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsAppClick}
                    className="w-full flex items-center justify-center px-2 py-1 text-xs bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors"
                  >
                    <svg className="h-3 w-3 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp ile Yaz
                  </a>
                )}
                
                {/* Mesaj butonu - varsayılan olarak göster (showMessage false değilse) */}
                {(listing.contactOptions?.showMessage !== false) && (
                  <button
                    onClick={handleMessage}
                    className="w-full flex items-center justify-center px-2 py-1 text-xs bg-alo-orange text-white rounded-lg hover:bg-alo-dark-orange transition-colors"
                  >
                    <MessageSquare className="h-3 w-3 mr-1.5" />
                    Mesaj Gönder
                  </button>
                )}
                
                <button
                  onClick={handleFavoriteToggle}
                  disabled={isFavoriteLoading}
                  className={`w-full flex items-center justify-center px-2 py-1 text-xs rounded-lg transition-colors ${
                    isFavorite
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-3 w-3 mr-1.5 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavoriteLoading ? 'İşleniyor...' : isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center px-2 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Share2 className="h-3 w-3 mr-1.5" />
                  Paylaş
                </button>
                
                <button
                  onClick={() => {
                    if (!session) {
                      const currentPath = window.location.pathname;
                      router.push(`/giris?callbackUrl=${encodeURIComponent(currentPath)}`);
                      return;
                    }
                    setShowReportDialog(true);
                  }}
                  className="w-full flex items-center justify-center px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Flag className="h-3 w-3 mr-1.5" />
                  İlanı Bildir
                </button>
              </div>
            </div>

            {/* Şikayet Dialog */}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>İlanı Bildir</DialogTitle>
                  <DialogDescription>
                    Bu ilanı neden bildirmek istiyorsunuz? Şikayetiniz incelenecektir.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şikayet Nedeni <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-alo-orange"
                      required
                    >
                      <option value="">Seçiniz...</option>
                      <option value="spam">Spam / Gereksiz İçerik</option>
                      <option value="inappropriate">Uygunsuz İçerik</option>
                      <option value="fake">Sahte / Yanıltıcı İlan</option>
                      <option value="duplicate">Tekrar Eden İlan</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama (Opsiyonel)
                    </label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-alo-orange"
                      placeholder="Şikayetiniz hakkında daha fazla bilgi verin..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <button
                    onClick={() => {
                      setShowReportDialog(false);
                      setReportReason('');
                      setReportDescription('');
                    }}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isReporting}
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={isReporting || !reportReason}
                    className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReporting ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
    </div>
  );
} 