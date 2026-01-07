'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, Crown, Star, Check, Zap, TrendingUp, Eye, Clock, Plus, X, Sparkles, EyeOff, Phone, MessageSquare } from 'lucide-react';
import { categories, Category } from '@/lib/categories';

export default function IlanVerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [images, setImages] = useState<File[]>([]);
  const [showPhone, setShowPhone] = useState(false);
  const [phoneVisibility, setPhoneVisibility] = useState('public'); // 'public', 'private'
  const [contactOptions, setContactOptions] = useState({
    showPhone: true,      // Telefon arama butonu
    showWhatsApp: true,   // WhatsApp butonu
    showMessage: true     // Mesaj butonu
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptionalFeatures, setShowOptionalFeatures] = useState(false);
  const [optionalFeatures, setOptionalFeatures] = useState<Array<{key: string, value: string}>>([]);
  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [newFeatureValue, setNewFeatureValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    featuredPrice: 50,
    urgentPrice: 30,
    highlightPrice: 25,
    topPrice: 75,
    // Plan bazlı resim limitleri
    noneMaxImages: 3,
    monthlyMaxImages: 5,
    quarterlyMaxImages: 10,
    yearlyMaxImagesPerListing: 10,
    // Plan bazlı ilan limitleri
    noneMaxListings: 0,
    monthlyMaxListings: 0,
    quarterlyMaxListings: 0,
    yearlyMaxListings: 20,
    // Plan bazlı toplam resim limitleri
    noneMaxTotalImages: 0,
    monthlyMaxTotalImages: 0,
    quarterlyMaxTotalImages: 0,
    yearlyMaxTotalImages: 200,
    // Premium paket fiyatları
    monthlyPremiumPrice: 199,
    quarterlyPremiumPrice: 494,
    yearlyPremiumPrice: 2179
  });
  const [premiumSettings, setPremiumSettings] = useState({
    featured: false,
    urgent: false,
    highlight: false,
    topPosition: false
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    location: '',
    phone: '',
    condition: 'Yeni', // 'Yeni' veya 'İkinci El'
    termsAccepted: false,
  });

  // Premium planlar - admin ayarlarından dinamik olarak güncellenecek
  const premiumPlans = useMemo(() => {
    const noneFeatures = [
      'Temel ilan özellikleri',
      `${adminSettings.noneMaxImages} adet resim yükleme`,
      'Standart görünüm'
    ];
    if (adminSettings.noneMaxListings > 0) {
      noneFeatures.push(`Maksimum ${adminSettings.noneMaxListings} aktif ilan`);
    }

    const monthlyFeatures = [
      'İlan öne çıkarma',
      'Premium rozeti',
      `${adminSettings.monthlyMaxImages} adet resim yükleme`,
      'Reklamsız deneyim'
    ];
    if (adminSettings.monthlyMaxListings > 0) {
      monthlyFeatures.push(`Maksimum ${adminSettings.monthlyMaxListings} aktif ilan`);
    }

    const quarterlyFeatures = [
      'İlan öne çıkarma',
      'Premium rozeti',
      `${adminSettings.quarterlyMaxImages} adet resim yükleme`,
      'Reklamsız deneyim',
      '1 ay bedava'
    ];
    if (adminSettings.quarterlyMaxListings > 0) {
      quarterlyFeatures.push(`Maksimum ${adminSettings.quarterlyMaxListings} aktif ilan`);
    }

    return {
    none: {
      name: 'Ücretsiz',
      price: 0,
      duration: '30 gün',
        features: noneFeatures
    },
    monthly: {
      name: 'Aylık Premium',
      price: adminSettings.monthlyPremiumPrice || 199,
      duration: '30 gün',
        features: monthlyFeatures
    },
    quarterly: {
      name: '3 Aylık Premium',
      price: adminSettings.quarterlyPremiumPrice || 494,
      duration: '90 gün',
        features: quarterlyFeatures
    },
    yearly: {
      name: 'Yıllık Premium',
      price: adminSettings.yearlyPremiumPrice || 2179,
      duration: '365 gün',
      features: [
        'İlan öne çıkarma',
        'Premium rozeti',
        `İlan başına ${adminSettings.yearlyMaxImagesPerListing} resim`,
        `Maksimum ${adminSettings.yearlyMaxListings} aktif ilan`,
        'Reklamsız deneyim',
        '3 ay bedava',
        'Özel destek hattı'
      ]
    }
    };
  }, [adminSettings]);

  // Premium özellik seçenekleri - Admin ayarlarından dinamik olarak
  const premiumFeatures = [
    {
      id: 'featured',
      name: 'Öne Çıkan İlan',
      description: 'İlanınız ana sayfada öne çıkarılır',
      price: adminSettings.featuredPrice,
      icon: Star
    },
    {
      id: 'urgent',
      name: 'Acil Satılık',
      description: 'Acil satılık rozeti ile dikkat çekin',
      price: adminSettings.urgentPrice,
      icon: Zap
    },
    {
      id: 'highlight',
      name: 'Renkli Vurgu',
      description: 'İlanınız renkli çerçeve ile vurgulanır',
      price: adminSettings.highlightPrice,
      icon: Sparkles
    },
    {
      id: 'topPosition',
      name: 'Üst Sıralama',
      description: 'Kategori sayfalarında üst sıralarda yer alın',
      price: adminSettings.topPrice,
      icon: TrendingUp
    }
  ];

  // Önceden tanımlanmış özellik seçenekleri
  const predefinedFeatures = [
    'Marka', 'Model', 'Renk', 'Boyut', 'Ağırlık', 'Malzeme', 'Garanti', 'Kullanım Süresi',
    'Durum', 'Paket İçeriği', 'Teknik Özellikler', 'Enerji Sınıfı', 'Güç', 'Kapasite',
    'Ölçüler', 'Stok Durumu', 'Teslimat', 'Ödeme Seçenekleri', 'İade Koşulları'
  ];

  const [imageError, setImageError] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const [userLimits, setUserLimits] = useState<{
    activeListingCount: number;
    totalImages: number;
    limits: { maxListings: number; maxTotalImages: number };
    isAdmin?: boolean;
  } | null>(null);

  // Kullanıcı limitlerini yükle (tüm planlar için)
  useEffect(() => {
    const fetchUserLimits = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user/limits');
          if (response.ok) {
            const data = await response.json();
            setUserLimits(data);
          }
        } catch (error) {
          console.error('Limit bilgileri yüklenemedi:', error);
        }
      } else {
        setUserLimits(null);
      }
    };
    fetchUserLimits();
  }, [session]);

  // Plan seçimine göre maksimum resim sayısı
  const MAX_IMAGES = useMemo(() => {
    const maxImages = (() => {
      switch (selectedPlan) {
        case 'none':
          return adminSettings.noneMaxImages;
        case 'monthly':
          return adminSettings.monthlyMaxImages;
        case 'quarterly':
          return adminSettings.quarterlyMaxImages;
        case 'yearly':
          // Yıllık plan: ilan başına resim sayısı (admin ayarlarından)
          return adminSettings.yearlyMaxImagesPerListing;
        default:
          return adminSettings.noneMaxImages;
      }
    })();
    console.log('MAX_IMAGES hesaplandı:', { selectedPlan, maxImages, noneMaxImages: adminSettings.noneMaxImages });
    return maxImages;
  }, [selectedPlan, userLimits, adminSettings]);

  // Giriş kontrolü ve kullanıcı bilgilerini yükle
  useEffect(() => {
    if (status === 'loading') {
      return; // Hala yükleniyor
    }

    if (!session || !session.user) {
      // Giriş yapılmamışsa, giriş sayfasına yönlendir
      router.push(`/giris?callbackUrl=${encodeURIComponent('/ilan-ver')}`);
      return;
    }

    // Kullanıcı bilgilerini API'den çek ve form'a doldur
    const loadUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // Sadece boş alanları doldur (kullanıcı daha önce bir şey yazmışsa koru)
            setFormData(prev => ({
              ...prev,
              phone: prev.phone || data.user.phone || '',
              location: prev.location || data.user.location || '',
            }));
          }
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
      }
    };

    loadUserProfile();
  }, [session, status, router]);

  // localStorage'dan form verilerini yükle (sadece bir kez, sayfa yüklendiğinde)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Form verilerini yükle
    const savedFormData = localStorage.getItem('ilanFormData');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(parsed);
        
        // Eğer formData'da category varsa ama selectedCategory yoksa, onu da set et
        if (parsed.category && !selectedCategory) {
          const category = categories.find(cat => cat.slug === parsed.category);
          if (category) {
            setSelectedCategory(category);
          }
        }
      } catch (e) {
        console.error('Form verileri yüklenirken hata:', e);
      }
    }

    // Kategoriyi yükle (localStorage'dan)
    const savedCategory = localStorage.getItem('ilanFormCategory');
    if (savedCategory) {
      const category = categories.find(cat => cat.slug === savedCategory);
      if (category) {
        setSelectedCategory(category);
      }
    }

    // Diğer ayarları yükle
    const savedPlan = localStorage.getItem('ilanFormPlan');
    if (savedPlan) {
      setSelectedPlan(savedPlan);
    }

    const savedPremiumSettings = localStorage.getItem('ilanFormPremiumSettings');
    if (savedPremiumSettings) {
      try {
        const parsed = JSON.parse(savedPremiumSettings);
        setPremiumSettings(parsed);
      } catch (e) {
        console.error('Premium ayarlar yüklenirken hata:', e);
      }
    }

    const savedOptionalFeatures = localStorage.getItem('ilanFormOptionalFeatures');
    if (savedOptionalFeatures) {
      try {
        const parsed = JSON.parse(savedOptionalFeatures);
        setOptionalFeatures(parsed);
      } catch (e) {
        console.error('Opsiyonel özellikler yüklenirken hata:', e);
      }
    }

    const savedPhoneVisibility = localStorage.getItem('ilanFormPhoneVisibility');
    if (savedPhoneVisibility) {
      setPhoneVisibility(savedPhoneVisibility);
    }

    const savedContactOptions = localStorage.getItem('ilanFormContactOptions');
    if (savedContactOptions) {
      try {
        const parsed = JSON.parse(savedContactOptions);
        setContactOptions(parsed);
      } catch (e) {
        console.error('İletişim seçenekleri yüklenirken hata:', e);
      }
    }

    // İlk yükleme tamamlandı
    setIsInitialLoad(false);
  }, []); // Sadece bir kez çalış

  // selectedCategory yüklendikten sonra subCategory'yi yükle
  useEffect(() => {
    if (!selectedCategory || typeof window === 'undefined') return;
    
    const savedSubCategory = localStorage.getItem('ilanFormSubCategory');
    if (savedSubCategory) {
      const subCategory = selectedCategory.subcategories?.find(sub => sub.slug === savedSubCategory);
      if (subCategory) {
        setSelectedSubCategory(subCategory);
      }
    }
  }, [selectedCategory]);

  // Form verilerini localStorage'a kaydet (ilk yükleme hariç)
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialLoad) return;
    localStorage.setItem('ilanFormData', JSON.stringify(formData));
  }, [formData, isInitialLoad]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedCategory) {
        localStorage.setItem('ilanFormCategory', selectedCategory.slug);
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedSubCategory) {
        localStorage.setItem('ilanFormSubCategory', selectedSubCategory.slug);
      }
    }
  }, [selectedSubCategory]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ilanFormPlan', selectedPlan);
    }
    
    // Plan değiştiğinde, eğer mevcut resim sayısı yeni limiti aşıyorsa fazla resimleri kaldır
    if (images.length > MAX_IMAGES) {
      setImages(prev => prev.slice(0, MAX_IMAGES));
      setImageError(`Plan değişti. Maksimum ${MAX_IMAGES} resim yükleyebilirsiniz. Fazla resimler kaldırıldı.`);
      // Hata mesajını 5 saniye sonra temizle
      setTimeout(() => setImageError(''), 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan, MAX_IMAGES]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ilanFormPremiumSettings', JSON.stringify(premiumSettings));
    }
  }, [premiumSettings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ilanFormOptionalFeatures', JSON.stringify(optionalFeatures));
    }
  }, [optionalFeatures]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ilanFormPhoneVisibility', phoneVisibility);
    }
  }, [phoneVisibility]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialLoad) {
      localStorage.setItem('ilanFormContactOptions', JSON.stringify(contactOptions));
    }
  }, [contactOptions, isInitialLoad]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageError('');
      const newImages = Array.from(e.target.files);
      
      // Toplam resim sayısı kontrolü
      const totalImages = images.length + newImages.length;
      if (totalImages > MAX_IMAGES) {
        setImageError(`Maksimum ${MAX_IMAGES} resim yükleyebilirsiniz. ${images.length} resim zaten yüklü.`);
        e.target.value = ''; // Input'u temizle
        return;
      }

      // Dosya boyutu kontrolü
      const oversizedFiles = newImages.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        setImageError(`Bazı dosyalar çok büyük. Maksimum dosya boyutu ${MAX_FILE_SIZE / (1024 * 1024)}MB'dir.`);
        e.target.value = ''; // Input'u temizle
        return;
      }

      // Dosya tipi kontrolü
      const invalidFiles = newImages.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        setImageError('Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF, vb.).');
        e.target.value = ''; // Input'u temizle
        return;
      }

      setImages(prev => [...prev, ...newImages].slice(0, MAX_IMAGES));
      e.target.value = ''; // Input'u temizle
    }
  };

  const removeImage = (index: number) => {
    // Son resim silinemez kontrolü
    if (images.length <= 1) {
      alert('En az bir resim bulunmalıdır. Resim olmadan ilan oluşturulamaz.');
      return;
    }
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageError('');
  };

  const handleCategoryChange = (categorySlug: string) => {
    const category = categories.find(cat => cat.slug === categorySlug);
    setSelectedCategory(category || null);
    setSelectedSubCategory(null);
    setFormData(prev => ({ ...prev, category: categorySlug, subCategory: '' }));
  };

  const handleSubCategoryChange = (subCategorySlug: string) => {
    const subCategory = selectedCategory?.subcategories?.find(sub => sub.slug === subCategorySlug);
    setSelectedSubCategory(subCategory || null);
    setFormData(prev => ({ ...prev, subCategory: subCategorySlug }));
  };

  const addOptionalFeature = () => {
    if (newFeatureKey.trim() && newFeatureValue.trim()) {
      setOptionalFeatures(prev => [...prev, { key: newFeatureKey.trim(), value: newFeatureValue.trim() }]);
      setNewFeatureKey('');
      setNewFeatureValue('');
    }
  };

  const removeOptionalFeature = (index: number) => {
    setOptionalFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handlePremiumSettingChange = (settingId: string) => {
    setPremiumSettings(prev => ({
      ...prev,
      [settingId]: !prev[settingId as keyof typeof prev]
    }));
  };

  const calculateTotalPrice = () => {
    const planPrice = premiumPlans[selectedPlan as keyof typeof premiumPlans].price;
    const premiumFeaturesPrice = Object.entries(premiumSettings)
      .filter(([_, enabled]) => enabled)
      .reduce((total, [settingId]) => {
        const feature = premiumFeatures.find(f => f.id === settingId);
        return total + (feature?.price || 0);
      }, 0);
    // KDV dahil toplam (KDV oranı %20)
    const taxRate = 20;
    const amountWithoutTax = planPrice + premiumFeaturesPrice;
    const totalWithTax = amountWithoutTax * (1 + taxRate / 100);
    return totalWithTax;
  };

  // Resimleri base64'e çevir (optimize edilmiş - boyut küçültülür)
  const convertImagesToBase64 = async (files: File[]): Promise<string[]> => {
    const { compressImagesToBase64 } = await import('@/lib/image-utils');
    try {
      // Resimleri optimize et: max 1920x1080, kalite 0.8
      return await compressImagesToBase64(files, 1920, 1080, 0.8);
    } catch (error) {
      console.error('Resim optimizasyon hatası:', error);
      // Fallback: Eğer optimizasyon başarısız olursa, orijinal boyutta yükle
      const promises = files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      return Promise.all(promises);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Form validasyonu
      if (!formData.title || !formData.description || !formData.price || !formData.category || !formData.location) {
        alert('Lütfen tüm zorunlu alanları doldurun.');
        setIsSubmitting(false);
        return;
      }

      // Resim zorunlu kontrolü
      if (!images || images.length === 0) {
        alert('En az bir resim yüklemelisiniz.');
        setIsSubmitting(false);
        return;
      }

      if (!formData.termsAccepted) {
        alert('Kullanım koşullarını kabul etmelisiniz.');
        setIsSubmitting(false);
        return;
      }

      // En az bir iletişim butonu seçilmeli
      const hasContactOption = contactOptions.showPhone || contactOptions.showWhatsApp || contactOptions.showMessage;
      if (!hasContactOption) {
        alert('Lütfen en az bir iletişim butonu seçin.');
        setIsSubmitting(false);
        return;
      }

      // Tüm planlar için limit kontrolleri (Admin kullanıcıları muaf)
      // API'den gelen isAdmin bilgisi daha güvenilir, yoksa session'dan veya email'den kontrol et
      let isAdmin = false;
      if (userLimits?.isAdmin === true) {
        isAdmin = true;
      } else if (session?.user?.role === 'admin') {
        isAdmin = true;
      } else if (session?.user?.email) {
        // Email'den admin kontrolü yap
        try {
          const { isAdminEmail } = await import('@/lib/admin');
          isAdmin = isAdminEmail(session.user.email);
        } catch (error) {
          console.error('Admin kontrolü hatası:', error);
        }
      }
      
      if (userLimits && !isAdmin) {
        // Seçilen plana göre limitleri belirle
        let maxListings = 0;
        
        switch (selectedPlan) {
          case 'none':
            maxListings = adminSettings.noneMaxListings;
            break;
          case 'monthly':
            maxListings = adminSettings.monthlyMaxListings;
            break;
          case 'quarterly':
            maxListings = adminSettings.quarterlyMaxListings;
            break;
          case 'yearly':
            maxListings = adminSettings.yearlyMaxListings;
            break;
        }

        // Aktif ilan sayısı kontrolü (0 değeri limit yok demektir)
        if (maxListings > 0 && userLimits.activeListingCount >= maxListings) {
          alert(`Maksimum ${maxListings} aktif ilanınız olabilir. Lütfen mevcut ilanlarınızdan birini kapatın veya süresi dolmasını bekleyin.`);
          setIsSubmitting(false);
          return;
        }
      }

      // Resimleri base64'e çevir (resim yoksa boş array gönder)
      const imageUrls = images.length > 0 
        ? await convertImagesToBase64(images)
        : [];

      // Kategori adını bul
      const categoryObj = categories.find(cat => cat.slug === formData.category);
      const categoryName = categoryObj?.name || formData.category;
      
      // Alt kategori adını bul
      const subCategoryObj = categoryObj?.subcategories?.find(sub => sub.slug === formData.subCategory);
      const subCategoryName = subCategoryObj?.name || formData.subCategory || null;

      // Seçilen plan bilgisi
      const selectedPlanData = premiumPlans[selectedPlan as keyof typeof premiumPlans];
      
      // Premium özellikleri hazırla
      const enabledPremiumFeatures = Object.entries(premiumSettings)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key);

      // İlan verilerini hazırla
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: categoryName,
        subCategory: subCategoryName,
        subSubCategory: null,
        location: formData.location,
        phone: formData.phone || null,
        showPhone: phoneVisibility === 'public',
        contactOptions: contactOptions, // WhatsApp, mesaj ve telefon seçenekleri
        images: imageUrls,
        features: optionalFeatures.length > 0 
          ? optionalFeatures.map(f => `${f.key}: ${f.value}`)
          : [],
        condition: formData.condition || 'Yeni',
        brand: null,
        isPremium: selectedPlan !== 'none',
        premiumFeatures: enabledPremiumFeatures.length > 0 ? enabledPremiumFeatures : null,
        premiumUntil: selectedPlan !== 'none' 
          ? new Date(Date.now() + (selectedPlanData.duration.includes('30') ? 30 : 60) * 24 * 60 * 60 * 1000).toISOString()
          : null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün sonra
      };

      // API'ye gönder
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      // Response'un JSON olup olmadığını kontrol et
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error('Sunucu hatası: ' + (text.substring(0, 100) || 'Bilinmeyen hata'));
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İlan oluşturulurken bir hata oluştu');
      }

      // ID kontrolü
      const listingId = data.listing?.id || data.id;
      if (!listingId) {
        console.error('API Response:', data);
        throw new Error('İlan oluşturuldu ancak ID alınamadı. Lütfen tekrar deneyin.');
      }

      console.log('İlan oluşturuldu, ID:', listingId);

      // Premium özellikler fiyatını hesapla
      const premiumFeaturesPrice = Object.entries(premiumSettings)
        .filter(([_, enabled]) => enabled)
        .reduce((total, [settingId]) => {
          if (settingId === 'featured') return total + adminSettings.featuredPrice;
          if (settingId === 'urgent') return total + adminSettings.urgentPrice;
          if (settingId === 'highlight') return total + adminSettings.highlightPrice;
          if (settingId === 'topPosition') return total + adminSettings.topPrice;
          return total;
        }, 0);

      // Ücretsiz plan seçilmişse ve premium özellik yoksa paymentData kaydetme
      // Premium plan seçilmişse veya premium özellik varsa paymentData kaydet
      if (selectedPlan !== 'none' || premiumFeaturesPrice > 0) {
        // KDV dahil toplam (KDV oranı %20)
        const taxRate = 20;
        const amountWithoutTax = selectedPlanData.price + premiumFeaturesPrice;
        const totalPrice = amountWithoutTax * (1 + taxRate / 100);

        const paymentData = {
          listingId: listingId,
          planType: selectedPlan,
          planName: selectedPlanData.name,
          planPrice: selectedPlanData.price,
          premiumFeatures: enabledPremiumFeatures,
          premiumFeaturesPrice: premiumFeaturesPrice,
          totalAmount: totalPrice,
          billingName: session?.user?.name || formData.title,
          billingEmail: session?.user?.email || '',
          billingPhone: formData.phone || '',
          billingAddress: formData.location || '',
          billingTaxId: '',
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('paymentData', JSON.stringify(paymentData));
        }
      } else {
        // Ücretsiz plan seçilmişse ve premium özellik yoksa paymentData'yı temizle
        if (typeof window !== 'undefined') {
          localStorage.removeItem('paymentData');
        }
      }

      // Önizleme sayfasına yönlendir
      if (listingId) {
        router.push(`/ilan-ver/onizle/${listingId}`);
      } else {
        console.error('İlan ID bulunamadı! API Response:', data);
        alert('İlan oluşturuldu ancak yönlendirme yapılamadı. Lütfen ilanlarım sayfasından kontrol edin.');
        router.push('/ilanlarim');
      }

    } catch (error: any) {
      console.error('İlan oluşturma hatası:', error);
      alert(error.message || 'İlan yayınlanırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin ayarlarını yükle
  const fetchAdminSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON, content-type:', contentType);
        const text = await response.text();
        console.error('Response text:', text.substring(0, 200));
        throw new Error('Response is not JSON');
      }
      
      const settings = await response.json();
      console.log('Admin ayarları yüklendi:', {
        noneMaxImages: settings.noneMaxImages,
        monthlyMaxImages: settings.monthlyMaxImages,
        quarterlyMaxImages: settings.quarterlyMaxImages,
        yearlyMaxImagesPerListing: settings.yearlyMaxImagesPerListing
      });
      setAdminSettings({
        featuredPrice: settings.featuredPrice ?? 50,
        urgentPrice: settings.urgentPrice ?? 30,
        highlightPrice: settings.highlightPrice ?? 25,
        topPrice: settings.topPrice ?? 75,
        // Plan bazlı resim limitleri
        noneMaxImages: settings.noneMaxImages ?? 3,
        monthlyMaxImages: settings.monthlyMaxImages ?? 5,
        quarterlyMaxImages: settings.quarterlyMaxImages ?? 10,
        yearlyMaxImagesPerListing: settings.yearlyMaxImagesPerListing ?? 10,
        // Plan bazlı ilan limitleri
        noneMaxListings: settings.noneMaxListings ?? 0,
        monthlyMaxListings: settings.monthlyMaxListings ?? 0,
        quarterlyMaxListings: settings.quarterlyMaxListings ?? 0,
        yearlyMaxListings: settings.yearlyMaxListings ?? 20,
        // Plan bazlı toplam resim limitleri
        noneMaxTotalImages: settings.noneMaxTotalImages ?? 0,
        monthlyMaxTotalImages: settings.monthlyMaxTotalImages ?? 0,
        quarterlyMaxTotalImages: settings.quarterlyMaxTotalImages ?? 0,
        yearlyMaxTotalImages: settings.yearlyMaxTotalImages ?? 200,
        // Premium paket fiyatları
        monthlyPremiumPrice: settings.monthlyPremiumPrice ?? 199,
        quarterlyPremiumPrice: settings.quarterlyPremiumPrice ?? 494,
        yearlyPremiumPrice: settings.yearlyPremiumPrice ?? 2179
      });
    } catch (error) {
      console.error('Admin ayarları yüklenirken hata:', error);
      if (error instanceof SyntaxError) {
        console.error('JSON parsing error - likely received HTML instead of JSON');
      }
      // Hata durumunda varsayılan değerleri kullan
      setAdminSettings({
        featuredPrice: 50,
        urgentPrice: 30,
        highlightPrice: 25,
        topPrice: 75,
        // Plan bazlı resim limitleri
        noneMaxImages: 3,
        monthlyMaxImages: 5,
        quarterlyMaxImages: 10,
        yearlyMaxImagesPerListing: 10,
        // Plan bazlı ilan limitleri
        noneMaxListings: 0,
        monthlyMaxListings: 0,
        quarterlyMaxListings: 0,
        yearlyMaxListings: 20,
        // Plan bazlı toplam resim limitleri
        noneMaxTotalImages: 0,
        monthlyMaxTotalImages: 0,
        quarterlyMaxTotalImages: 0,
        yearlyMaxTotalImages: 200,
        // Premium paket fiyatları
        monthlyPremiumPrice: 199,
        quarterlyPremiumPrice: 494,
        yearlyPremiumPrice: 2179
      });
    }
  };

  useEffect(() => {
    fetchAdminSettings();
    
    // Her 30 saniyede bir admin ayarlarını kontrol et
    const interval = setInterval(fetchAdminSettings, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Loading durumu
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Giriş yapılmamışsa hiçbir şey gösterme (yönlendirme yapılacak)
  if (!session || !session.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">İlan Ver</h1>
            <p className="text-sm sm:text-base text-gray-600">Ürününüzü veya hizmetinizi satışa çıkarın</p>
          </div>

          {/* Premium Plans */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mr-2" />
              Premium Plan Seçin
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Object.entries(premiumPlans).map(([key, plan]) => (
                <div 
                  key={key} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan === key 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'hover:shadow-md hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    {selectedPlan === key && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">{plan.duration}</div>
                  <ul className="space-y-1 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Premium İlan Ayarları */}
          {selectedPlan !== 'none' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                Premium İlan Ayarları
              </h2>
              <p className="text-gray-600 mb-4">
                İlanınızı daha etkili hale getirmek için ek özellikler seçebilirsiniz.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {premiumFeatures.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <div 
                      key={feature.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        premiumSettings[feature.id as keyof typeof premiumSettings]
                          ? 'border-purple-500 bg-purple-50 shadow-md' 
                          : 'hover:shadow-md hover:border-gray-300'
                      }`}
                      onClick={() => handlePremiumSettingChange(feature.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <IconComponent className="w-5 h-5 text-purple-500 mr-2" />
                          <h3 className="font-semibold text-sm">{feature.name}</h3>
                        </div>
                        {premiumSettings[feature.id as keyof typeof premiumSettings] && (
                          <Check className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
                      <div className="text-sm font-bold text-purple-600">₺{feature.price}</div>
                    </div>
                  );
                })}
              </div>

              {/* Toplam Fiyat */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Toplam Premium Ücret (KDV Dahil):</span>
                  <span className="text-2xl font-bold text-purple-600">₺{calculateTotalPrice().toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Plan ücreti + seçilen özellikler (KDV %20 dahil)
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">İlan Bilgileri</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlan Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="İlan başlığınızı girin"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              {selectedCategory?.subcategories && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Kategori
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Alt kategori seçin</option>
                    {selectedCategory.subcategories.map((sub) => (
                      <option key={sub.slug} value={sub.slug}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ürün veya hizmetiniz hakkında detaylı bilgi verin"
                />
              </div>

              {/* Price */}
              {formData.category !== 'ucretsiz-gel-al' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (TL) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Fiyat girin"
                  />
                </div>
              )}
              
              {formData.category === 'ucretsiz-gel-al' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (TL)
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
                    Ücretsiz Gel Al kategorisi seçili - fiyat alanı gizli
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ücretsiz Gel Al kategorisinde fiyat belirtmenize gerek yoktur.
                  </p>
                </div>
              )}

              {/* Condition - Yeni/İkinci El */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum *
                </label>
                <select
                  required
                  value={formData.condition}
                  onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Yeni">Yeni</option>
                  <option value="İkinci El">İkinci El</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Şehir, ilçe"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              {/* Phone Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon Görünürlüğü
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="phoneVisibility"
                      value="public"
                      checked={phoneVisibility === 'public'}
                      onChange={(e) => setPhoneVisibility(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm">Herkese Açık</span>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="phoneVisibility"
                      value="private"
                      checked={phoneVisibility === 'private'}
                      onChange={(e) => setPhoneVisibility(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <EyeOff className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-sm">Gizli</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* İletişim Seçenekleri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İletişim Butonları
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  İlan detay sayfasında hangi iletişim butonlarının gösterileceğini seçin (en az bir tanesi seçilmeli)
                </p>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactOptions.showPhone}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        // Eğer kapatılmaya çalışılıyorsa ve bu son seçili buton ise engelle
                        if (!newValue && !contactOptions.showWhatsApp && !contactOptions.showMessage) {
                          alert('En az bir iletişim butonu seçili olmalıdır.');
                          return;
                        }
                        setContactOptions(prev => ({ ...prev, showPhone: newValue }));
                      }}
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm text-gray-700">Telefon Arama Butonu</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactOptions.showWhatsApp}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        // Eğer kapatılmaya çalışılıyorsa ve bu son seçili buton ise engelle
                        if (!newValue && !contactOptions.showPhone && !contactOptions.showMessage) {
                          alert('En az bir iletişim butonu seçili olmalıdır.');
                          return;
                        }
                        setContactOptions(prev => ({ ...prev, showWhatsApp: newValue }));
                      }}
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="#25D366" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span className="text-sm text-gray-700">WhatsApp Butonu</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactOptions.showMessage}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        // Eğer kapatılmaya çalışılıyorsa ve bu son seçili buton ise engelle
                        if (!newValue && !contactOptions.showPhone && !contactOptions.showWhatsApp) {
                          alert('En az bir iletişim butonu seçili olmalıdır.');
                          return;
                        }
                        setContactOptions(prev => ({ ...prev, showMessage: newValue }));
                      }}
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-sm text-gray-700">Mesaj Butonu</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Optional Features */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">İsteğe Bağlı Özellikler</h3>
                  <button
                    type="button"
                    onClick={() => setShowOptionalFeatures(!showOptionalFeatures)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    {showOptionalFeatures ? (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Gizle
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Özellik Ekle
                      </>
                    )}
                  </button>
                </div>

                {showOptionalFeatures && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Ürününüzün ek özelliklerini belirtmek için özellik ekleyebilirsiniz. (Örn: Marka, Model, Renk, Boyut vb.)
                    </p>

                    {/* Add New Feature */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Özellik Adı
                        </label>
                        <select
                          value={newFeatureKey}
                          onChange={(e) => setNewFeatureKey(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Özellik seçin</option>
                          {predefinedFeatures.map((feature) => (
                            <option key={feature} value={feature}>
                              {feature}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Değer
                        </label>
                        <input
                          type="text"
                          value={newFeatureValue}
                          onChange={(e) => setNewFeatureValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Özellik değeri"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={addOptionalFeature}
                          disabled={!newFeatureKey || !newFeatureValue}
                          className={`w-full px-4 py-2 rounded-md transition-colors ${
                            newFeatureKey && newFeatureValue
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Ekle
                        </button>
                      </div>
                    </div>

                    {/* Custom Feature Input */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Özel Özellik
                        </label>
                        <input
                          type="text"
                          value={newFeatureKey}
                          onChange={(e) => setNewFeatureKey(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Özel özellik adı"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Değer
                        </label>
                        <input
                          type="text"
                          value={newFeatureValue}
                          onChange={(e) => setNewFeatureValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Özellik değeri"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={addOptionalFeature}
                          disabled={!newFeatureKey || !newFeatureValue}
                          className={`w-full px-4 py-2 rounded-md transition-colors ${
                            newFeatureKey && newFeatureValue
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Ekle
                        </button>
                      </div>
                    </div>

                    {/* Display Added Features */}
                    {optionalFeatures.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Eklenen Özellikler:</h4>
                        <div className="space-y-2">
                          {optionalFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                              <div>
                                <span className="font-medium text-gray-900">{feature.key}:</span>
                                <span className="ml-2 text-gray-700">{feature.value}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeOptionalFeature(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resimler
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Resim yüklemek için tıklayın</p>
                  <p className="text-sm text-gray-500 mb-3">
                    {MAX_IMAGES >= 999 ? (
                      <>Sınırsız resim yükleyebilirsiniz, her biri en fazla {MAX_FILE_SIZE / (1024 * 1024)}MB</>
                    ) : (
                      <>Maksimum {MAX_IMAGES} resim, her biri en fazla {MAX_FILE_SIZE / (1024 * 1024)}MB</>
                    )}
                  </p>
                  <p className="text-sm text-blue-600 mb-3">
                    {MAX_IMAGES >= 999 ? (
                      <>{images.length} resim yüklendi</>
                    ) : (
                      <>{images.length}/{MAX_IMAGES} resim yüklendi</>
                    )}
                  </p>
                  {/* Normal dosya seçme (Desktop ve Galeri) */}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={MAX_IMAGES < 999 && images.length >= MAX_IMAGES}
                  />
                  
                  {/* Kamera ile çekme (Mobil) */}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-camera"
                    disabled={MAX_IMAGES < 999 && images.length >= MAX_IMAGES}
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <label
                      htmlFor="image-upload"
                      className={`inline-block px-4 py-2 rounded-md cursor-pointer transition-colors ${
                        MAX_IMAGES < 999 && images.length >= MAX_IMAGES
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {MAX_IMAGES < 999 && images.length >= MAX_IMAGES ? 'Maksimum resim sayısına ulaşıldı' : 'Galeriden Seç'}
                    </label>
                    
                    {/* Mobil cihazlarda kamera butonu göster */}
                    <label
                      htmlFor="image-upload-camera"
                      className={`inline-flex items-center px-4 py-2 rounded-md cursor-pointer transition-colors ${
                        MAX_IMAGES < 999 && images.length >= MAX_IMAGES
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {MAX_IMAGES < 999 && images.length >= MAX_IMAGES ? 'Limit Doldu' : 'Kamera ile Çek'}
                    </label>
                  </div>
                </div>
                
                {/* Hata Mesajı */}
                {imageError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{imageError}</p>
                  </div>
                )}

                {/* Yüklenen Resimler */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {MAX_IMAGES >= 999 ? (
                        <>Yüklenen Resimler ({images.length})</>
                      ) : (
                        <>Yüklenen Resimler ({images.length}/{MAX_IMAGES})</>
                      )}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Resmi kaldır"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {(image.size / (1024 * 1024)).toFixed(2)}MB
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="border-t pt-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      <a 
                        href="/kullanim-kosullari" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        Kullanım Koşulları
                      </a>{' '}
                      ve{' '}
                      <a 
                        href="/gizlilik-politikasi" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        Gizlilik Politikası
                      </a>'nı okudum ve kabul ediyorum. *
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      İlanınızı yayınlayarak, platform kurallarına uygun olduğunu ve doğru bilgiler verdiğinizi onaylıyorsunuz.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  {showPreview ? 'Önizlemeyi Kapat' : 'Önizle'}
                </button>
                <button
                  type="submit"
                  disabled={!formData.termsAccepted || isSubmitting}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    formData.termsAccepted && !isSubmitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">İlan Önizlemesi</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{formData.title || 'İlan Başlığı'}</h1>
                  <p className="text-lg font-semibold text-blue-600 mt-2">
                    {formData.price ? `₺${formData.price}` : 'Fiyat Belirtilmemiş'}
                  </p>
                </div>

                {/* Images */}
                {images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Resimler</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Açıklama</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {formData.description || 'Açıklama girilmemiş'}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Kategori</h3>
                  <p className="text-gray-700">
                    {selectedCategory?.name || 'Kategori seçilmemiş'}
                    {selectedSubCategory && ` > ${selectedSubCategory.name}`}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Konum</h3>
                  <p className="text-gray-700">{formData.location || 'Konum belirtilmemiş'}</p>
                </div>

                {/* Phone Visibility */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">İletişim</h3>
                  <div className="flex items-center space-x-2">
                    {phoneVisibility === 'public' && (
                      <>
                        <Eye className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Telefon: {formData.phone || 'Belirtilmemiş'}</span>
                      </>
                    )}
                    {phoneVisibility === 'private' && (
                      <>
                        <EyeOff className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-700">Telefon gizli</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Optional Features */}
                {optionalFeatures.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Özellikler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {optionalFeatures.map((feature, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded">
                          <span className="font-medium text-gray-900">{feature.key}:</span>
                          <span className="ml-2 text-gray-700">{feature.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Premium Features */}
                {selectedPlan !== 'none' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Premium Özellikler</h3>
                    <div className="flex flex-wrap gap-2">
                      {premiumSettings.featured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Öne Çıkan</span>
                      )}
                      {premiumSettings.urgent && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Acil Satılık</span>
                      )}
                      {premiumSettings.highlight && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Vurgulu</span>
                      )}
                      {premiumSettings.topPosition && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Üst Sıralama</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Kapat
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    // Scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Düzenlemeye Devam Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 