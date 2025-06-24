// İlan tipleri ve durumları
export const listingTypes = {
  FREE: 'free',
  PREMIUM: 'premium'
} as const;

export const listingStatus = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SOLD: 'sold',
  EXPIRED: 'expired'
} as const;

// Kategori ve alt kategori tipleri
export type CategorySlug = 'elektronik' | 'spor' | 'ev-yasam' | 'hizmetler';
export type SubCategorySlug = 'telefon' | 'bilgisayar' | 'fitness' | 'tenis' | 'mobilya' | 'beyaz-esya' | 'ozel-ders' | 'temizlik';

// Satıcı tipi
export type Seller = {
  name: string;
  rating: number;
  memberSince: string;
  phone?: string;
  isVerified?: boolean;
};

// Premium özellikler tipi
export type PremiumFeature = {
  isActive: boolean;
  expiresAt: string | null;
  isHighlighted: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
};

// İlan tipi
export interface Listing {
  id: string | number;
  title: string;
  description: string;
  price: number | string;
  location: string;
  category: string;
  subCategory?: string;
  subSubCategory?: string;
  images: string[];
  isPremium: boolean;
  premiumUntil?: string;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
  // Kullanıcı ilanları için ek özellikler
  plan?: string;
  planName?: string;
  planPrice?: number;
  views?: number;
  likes?: number;
  status?: string;
  phone?: string;
}

// Kategori Tipi
export type Category = {
  id: number;
  name: string;
  icon: string;
  slug: string;
  subcategories: {
    id: number;
    name: string;
    slug: string;
  }[];
};

// Alt Kategori Tipi
export type Subcategory = {
  id: number;
  name: string;
  slug: string;
}; 