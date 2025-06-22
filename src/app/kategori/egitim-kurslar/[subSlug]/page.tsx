"use client"

import { useParams } from "next/navigation";
import { listings } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import { Listing } from "@/types/listings";
import { categories } from "@/lib/categories";
import Link from "next/link";
import { FeaturedAds } from "@/components/featured-ads";
import { LatestAds } from "@/components/latest-ads";

export default function EgitimKurslarSubPage() {
  const params = useParams() as { subSlug: string };
  const subSlug = params.subSlug;

  // Eğitim & Kurslar kategorisini bul
  const egitimKurslarCategory = categories.find(cat => cat.slug === 'egitim-kurslar');
  const subcategory = egitimKurslarCategory?.subcategories?.find(sub => sub.slug === subSlug);

  // İlgili alt kategorinin ilanlarını filtrele
  const filteredListings = listings
    .filter(
      (listing) =>
        listing.category === "egitim-kurslar" &&
        listing.subCategory === subSlug
    )
    .map((listing) => ({
      id: listing.id.toString(),
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subCategory: listing.subCategory,
      images: listing.images,
      isPremium: listing.isPremium,
      premiumUntil: listing.premiumUntil,
      createdAt: listing.createdAt,
      user: listing.user,
    }));

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Alt kategori bulunamadı</h1>
          <Link href="/kategori/egitim-kurslar" className="text-blue-600 hover:text-blue-800">
            Eğitim ve Kurslar'a Dön
          </Link>
        </div>
      </div>
    );
  }

  // Diğer alt kategoriler
  const otherSubcategories = egitimKurslarCategory?.subcategories?.filter(sub => sub.slug !== subSlug) || [];

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/kategori/egitim-kurslar" className="hover:text-blue-600">Eğitim & Kurslar</Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{subcategory.name}</li>
        </ol>
      </nav>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          {/* Alt Kategoriler */}
          {subcategory.subcategories && subcategory.subcategories.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold mb-4 text-lg">Alt Kategoriler</h2>
              <ul className="space-y-2">
                {subcategory.subcategories.map((subsub) => (
                  <li key={subsub.slug}>
                    <Link 
                      href={`/kategori/egitim-kurslar/${subSlug}/${subsub.slug}`}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-lg">
                        {typeof subsub.icon === 'string' ? subsub.icon : <subsub.icon className="w-5 h-5" />}
                      </span>
                      <span>{subsub.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Diğer Kategoriler */}
          <div>
            <h2 className="font-semibold mb-4 text-lg">Diğer Kategoriler</h2>
            <ul className="space-y-2">
              {otherSubcategories.map((sub) => (
                <li key={sub.slug}>
                  <Link 
                    href={`/kategori/egitim-kurslar/${sub.slug}`}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg">
                      {typeof sub.icon === 'string' ? sub.icon : <sub.icon className="w-5 h-5" />}
                    </span>
                    <span>{sub.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* İçerik */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-6">{subcategory.name}</h1>
          
          <FeaturedAds 
            category="egitim-kurslar" 
            subcategory={subSlug} 
            listings={filteredListings} 
          />
          
          <LatestAds 
            category="egitim-kurslar" 
            subcategory={subSlug} 
            listings={filteredListings} 
          />
        </main>
      </div>
    </div>
  );
} 