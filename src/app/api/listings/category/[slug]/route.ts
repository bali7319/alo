import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const subSlug = searchParams.get('subSlug');

    let whereClause: any = {
      isActive: true,
      approvalStatus: 'approved'
    };

    // Kategori slug'ını kategori adına çevir
    const categoryMap: { [key: string]: string } = {
      'is': 'İş',
      'hizmetler': 'Hizmetler',
      'elektronik': 'Elektronik',
      'ev-ve-bahce': 'Ev & Bahçe',
      'giyim': 'Giyim',
      'moda-stil': 'Moda & Stil',
      'sporlar-oyunlar-eglenceler': 'Sporlar, Oyunlar ve Eğlenceler',
      'anne-bebek': 'Anne & Bebek',
      'cocuk-dunyasi': 'Çocuk Dünyası',
      'egitim-kurslar': 'Eğitim & Kurslar',
      'yemek-icecek': 'Yemek & İçecek',
      'catering-ticaret': 'Catering & Ticaret',
      'turizm-konaklama': 'Turizm & Konaklama',
      'saglik-guzellik': 'Sağlık & Güzellik',
      'sanat-hobi': 'Sanat & Hobi',
      'ucretsiz-gel-al': 'Ücretsiz Gel Al',
      'diger': 'Diğer'
    };

    const categoryName = categoryMap[slug];
    if (categoryName) {
      whereClause.category = categoryName;
    }

    // Alt kategori varsa ekle
    if (subSlug) {
      const subCategoryMap: { [key: string]: string } = {
        'guvenlik': 'Güvenlik',
        'nakliyat': 'Nakliyat',
        'tasarim': 'Tasarım',
        'teknik-servis': 'Teknik Servis',
        'temizlik': 'Temizlik',
        'bilgisayar': 'Bilgisayar',
        'kamera': 'Kamera',
        'kulaklik': 'Kulaklık',
        'network': 'Network',
        'oyun-konsolu': 'Oyun Konsolu',
        'tablet': 'Tablet',
        'telefon': 'Telefon',
        'televizyon': 'Televizyon',
        'yazici': 'Yazıcı',
        'aydinlatma': 'Aydınlatma',
        'bahce-aletleri': 'Bahçe Aletleri',
        'beyaz-esya': 'Beyaz Eşya',
        'dekorasyon': 'Dekorasyon',
        'isitma-sogutma': 'Isıtma/Soğutma',
        'mobilya': 'Mobilya',
        'mutfak-gerecleri': 'Mutfak Gereçleri',
        'aksesuar': 'Aksesuar',
        'ayakkabi': 'Ayakkabı',
        'ayakkabi-canta': 'Ayakkabı & Çanta',
        'bayan-giyim': 'Bayan Giyim',
        'cocuk-giyim': 'Çocuk Giyim',
        'erkek-giyim': 'Erkek Giyim',
        'kadin': 'Kadın',
        'kadin-giyim': 'Kadın Giyim',
        'cocuk': 'Çocuk',
        'erkek': 'Erkek'
      };

      const subCategoryName = subCategoryMap[subSlug];
      if (subCategoryName) {
        whereClause.subCategory = subCategoryName;
      }
    }

    const listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subCategory: listing.subCategory,
      description: listing.description,
      images: JSON.parse(listing.images),
      createdAt: listing.createdAt.toISOString(),
      condition: listing.condition,
      isPremium: listing.isPremium,
      premiumUntil: listing.premiumUntil?.toISOString(),
      expiresAt: listing.expiresAt.toISOString(),
      views: listing.views,
      user: listing.user,
    }));

    return NextResponse.json({ listings: formattedListings });
  } catch (error) {
    console.error('Kategori ilanları getirme hatası:', error);
    return NextResponse.json(
      { error: 'İlanlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
} 