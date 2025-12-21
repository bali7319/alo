import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { Home, Sparkles, Star, MapPin, Users, Clock, Shield, Award } from 'lucide-react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// generateStaticParams fonksiyonu ekle
export async function generateStaticParams() {
  const params: { slug: string; subSlug: string }[] = [];
  
  // Tüm kategoriler ve alt kategoriler için statik parametreler oluştur
  categories.forEach((category) => {
    category.subcategories?.forEach((subcategory) => {
      params.push({
        slug: category.slug,
        subSlug: subcategory.slug,
      });
    });
  });
  
  return params;
}

export default async function SubCategoryPage({ params }: { params: Promise<{ slug: string; subSlug: string }> }) {
  const { slug, subSlug } = await params;

  // Ana kategoriyi bul
  const foundCategory = categories.find((cat) => cat.slug === slug)
  if (!foundCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategori bulunamadı</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  // Alt kategoriyi bul
  const foundSubcategory = foundCategory.subcategories?.find((sub) => sub.slug === subSlug)
  if (!foundSubcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Alt kategori bulunamadı</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  // Diğer alt kategoriler
  const otherSubcategories = foundCategory.subcategories?.filter((sub) => sub.slug !== subSlug) || []

  // Kategori ve alt kategori slug'larını adlarına çevir
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

  const categoryName = categoryMap[slug];
  const subCategoryName = subCategoryMap[subSlug];

  // Veritabanından ilanları çek (build sırasında hata olursa boş liste)
  let listings: Awaited<ReturnType<typeof prisma.listing.findMany<{
    include: { user: { select: { id: true; name: true; email: true } } }
  }>>> = [];
  try {
    listings = await prisma.listing.findMany({
      where: {
        category: categoryName,
        subCategory: subCategoryName,
        isActive: true,
        approvalStatus: 'approved'
      },
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
  } catch (error) {
    // Build sırasında veritabanı bağlantısı yoksa boş liste
    console.warn('Database connection failed during build, using empty listings');
  }

  const formattedListings = listings.map(listing => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    location: listing.location,
    category: listing.category,
    subCategory: listing.subCategory || undefined,
    description: listing.description,
    images: JSON.parse(listing.images),
    createdAt: listing.createdAt.toISOString(),
    condition: listing.condition,
    isPremium: listing.isPremium,
    premiumUntil: listing.premiumUntil?.toISOString(),
    expiresAt: listing.expiresAt.toISOString(),
    views: listing.views,
    user: {
      id: listing.user.id,
      name: listing.user.name || undefined,
      email: listing.user.email,
    },
  }));

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600 flex items-center">
              <Home className="w-4 h-4 mr-1" />
              Ana Sayfa
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href={`/kategori/${foundCategory.slug}`} className="text-gray-700 hover:text-blue-600">
                {foundCategory.name}
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{foundSubcategory.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
              Diğer {foundCategory.name} Kategorileri
            </h2>
            <ul className="space-y-2">
              {otherSubcategories.map((sub: any) => (
                <li key={sub.slug}>
                  <Link 
                    href={`/kategori/${foundCategory.slug}/${sub.slug}`}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span className="mr-2 text-lg">{typeof sub.icon === 'string' ? sub.icon : '•'}</span>
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h3 className="font-semibold mb-3 flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                Kategori Özellikleri
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Shield className="w-4 h-4 text-green-500 mr-2" />
                  Güvenilir Satıcılar
                </li>
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                  Hızlı Teslimat
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 text-purple-500 mr-2" />
                  Geniş Seçenek
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-yellow-500 mr-2" />
                  Kaliteli Ürünler
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 text-red-500 mr-2" />
                  Yerel Satıcılar
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="mr-3 text-2xl">{typeof foundSubcategory.icon === 'string' ? foundSubcategory.icon : '•'}</span>
              {foundSubcategory.name}
            </h1>
            <p className="text-gray-600">
              {foundSubcategory.name} kategorisinde en iyi ürünleri ve hizmetleri keşfedin.
            </p>
          </div>

          {/* Featured Ads */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Öne Çıkan {foundSubcategory.name}
            </h2>
            <FeaturedAds 
              category={foundCategory.slug} 
              subcategory={foundSubcategory.slug} 
              listings={formattedListings} 
            />
          </div>

          {/* Latest Ads */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              Son Eklenen {foundSubcategory.name}
            </h2>
            <LatestAds 
              category={foundCategory.slug} 
              subcategory={foundSubcategory.slug} 
              listings={formattedListings} 
            />
          </div>
        </main>
      </div>
    </div>
  )
} 