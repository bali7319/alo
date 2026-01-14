"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { categories } from "@/lib/categories"
import { Input } from "@/components/ui/input"
import { 
  Smartphone, 
  Laptop, 
  Home, 
  Shirt, 
  ShirtIcon,
  Baby, 
  Gamepad2, 
  GraduationCap, 
  Utensils, 
  Plane, 
  Heart, 
  Palette, 
  Gift, 
  Package,
  Briefcase,
  Wrench,
  Store,
  Hotel,
  MoreHorizontal,
  Menu,
  X,
  Search
} from "lucide-react"

const categoryFallbackIcons = {
  is: Briefcase,
  hizmetler: Wrench,
  elektronik: Smartphone,
  "ev-ve-bahce": Home,
  giyim: Shirt,
  "moda-stil": ShirtIcon,
  "sporlar-oyunlar-eglenceler": Gamepad2,
  "anne-bebek": Baby,
  "cocuk-dunyasi": Baby,
  "egitim-kurslar": GraduationCap,
  "yemek-icecek": Utensils,
  "catering-ticaret": Store,
  "turizm-konaklama": Hotel,
  "saglik-guzellik": Heart,
  "sanat-hobi": Palette,
  "ucretsiz-gel-al": Gift
}

export const Sidebar = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Pathname'i parse et: /kategori/hizmetler/guvenlik -> ['kategori', 'hizmetler', 'guvenlik']
  const pathSegments = pathname?.split("/").filter(Boolean) || []
  
  // URL yapısını kontrol et
  const isCategoryRoute = pathSegments[0] === 'kategori'
  const currentCategory = isCategoryRoute ? pathSegments[1] : undefined
  const currentSubcategory = isCategoryRoute && pathSegments.length >= 3 ? pathSegments[2] : undefined
  
  // Alt kategori sayfası kontrolü: /kategori/[slug]/[subSlug] veya /kategori/[slug]/[subSlug]/[subsubslug]
  const isSubCategoryPage = isCategoryRoute && currentSubcategory !== undefined && currentSubcategory !== ''
  
  // Kategori arama filtresi
  const filterCategories = (cats: typeof categories) => {
    if (!searchTerm.trim()) return cats;
    const searchLower = searchTerm.toLowerCase();
    return cats.filter(cat => {
      const matchesName = cat.name.toLowerCase().includes(searchLower);
      const matchesSubcategory = cat.subcategories?.some(sub => 
        sub.name.toLowerCase().includes(searchLower) ||
        sub.subcategories?.some(subSub => subSub.name.toLowerCase().includes(searchLower))
      );
      return matchesName || matchesSubcategory;
    });
  };
  
  // Alt kategori arama filtresi
  const filterSubCategories = (subCats: typeof categories[0]['subcategories']) => {
    if (!searchTerm.trim() || !subCats) return subCats;
    const searchLower = searchTerm.toLowerCase();
    return subCats.filter(sub => {
      const matchesName = sub.name.toLowerCase().includes(searchLower);
      const matchesSubSub = sub.subcategories?.some(subSub => 
        subSub.name.toLowerCase().includes(searchLower)
      );
      return matchesName || matchesSubSub;
    });
  };

  // Aktif kategoriyi bul
  const activeCategory = currentCategory ? categories.find(cat => cat.slug === currentCategory) : undefined

  // Alt-alt kategori kontrolü
  const currentSubSubcategory = isCategoryRoute && pathSegments.length >= 4 ? pathSegments[3] : undefined

  return (
    <>
      {/* Mobil Menü Toggle Butonu */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-20 left-4 z-[60] bg-white border border-gray-300 rounded-md p-2 shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Kategoriler menüsünü aç/kapat"
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-700" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Mobil Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav 
        className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white p-4 border-r z-50 md:z-auto transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Kategoriler menüsü"
      >
        {/* Arama Kutusu */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      {!isSubCategoryPage ? (
        // Ana kategori sayfasında: O kategorinin alt kategorilerini göster
        activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Alt Kategoriler</h2>
            {searchTerm.trim() && filterSubCategories(activeCategory.subcategories)?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Aradığınız kriterlere uygun alt kategori bulunamadı.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Aramayı temizle
                </button>
              </div>
            ) : (
              <ul className="space-y-1" role="list">
                {filterSubCategories(activeCategory.subcategories)?.map((subcategory) => {
                const hasSubSubcategories = subcategory.subcategories && subcategory.subcategories.length > 0;
                
                return (
                  <li key={`${activeCategory.slug}-${subcategory.slug}`} role="listitem" className="mb-1">
                    <Link
                      href={`/kategori/${activeCategory.slug}/${subcategory.slug}`}
                      prefetch={false}
                      className="block px-3 py-2 text-sm rounded-md transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {typeof subcategory.icon === 'string' ? subcategory.icon : '•'}
                        </span>
                        <span className="flex-1">{subcategory.name}</span>
                        {hasSubSubcategories && (
                          <span className="text-xs text-gray-400">▼</span>
                        )}
                      </div>
                    </Link>
                    
                    {/* Alt-alt kategoriler */}
                    {hasSubSubcategories && subcategory.subcategories && (
                      <ul className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-3" role="list">
                        {subcategory.subcategories.map((subsubcategory) => {
                          return (
                            <li key={`${activeCategory.slug}-${subcategory.slug}-${subsubcategory.slug}`} role="listitem">
                              <Link
                                href={`/kategori/${activeCategory.slug}/${subcategory.slug}/${subsubcategory.slug}`}
                                className="block px-2 py-1.5 text-xs rounded transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">
                                    {typeof subsubcategory.icon === 'string' ? subsubcategory.icon : '•'}
                                  </span>
                                  <span>{subsubcategory.name}</span>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
              </ul>
            )}
            {searchTerm.trim() && filterSubCategories(activeCategory.subcategories) && filterSubCategories(activeCategory.subcategories)!.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                {filterSubCategories(activeCategory.subcategories)!.length} alt kategori bulundu
              </div>
            )}
          </>
        ) : (
          // Alt kategorisi yoksa ana kategorileri göster
          <>
            <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
            {searchTerm.trim() && filterCategories(categories).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Aradığınız kriterlere uygun kategori bulunamadı.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Aramayı temizle
                </button>
              </div>
            ) : (
              <ul className="space-y-2" role="list">
                {filterCategories(categories).map((category) => {
                const FallbackIcon = categoryFallbackIcons[category.slug as keyof typeof categoryFallbackIcons] || MoreHorizontal;
                const isActive = currentCategory === category.slug;
                
                return (
                  <li key={category.slug} role="listitem">
                    <Link
                      href={`/kategori/${category.slug}`}
                      prefetch={false}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50 hover:translate-x-1"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={`${category.name} kategorisini görüntüle`}
                    >
                      <span className="relative w-5 h-5 flex-shrink-0" aria-hidden="true">
                        <Image
                          src={`/category-icons/${category.slug}.svg`}
                          alt=""
                          fill
                          sizes="20px"
                          className="object-contain"
                          onError={(e) => {
                            // Next/Image onError doesn't provide direct fallback render;
                            // fallback icon is rendered below if image fails in some browsers.
                            (e.currentTarget as any).style.display = 'none'
                          }}
                        />
                        <FallbackIcon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                      </span>
                      <span>{category.name}</span>
                    </Link>
                  </li>
                )
              })}
              </ul>
            )}
            {searchTerm.trim() && filterCategories(categories).length > 0 && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                {filterCategories(categories).length} kategori bulundu
              </div>
            )}
          </>
        )
      ) : (
        // Alt kategori sayfasında: Sadece o kategorinin alt kategorilerini göster
        activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
          <>
            <div className="mb-4">
              <Link
                href={`/kategori/${activeCategory.slug}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-2"
              >
                <span className="text-lg">
                  {typeof activeCategory.icon === 'string' ? activeCategory.icon : '•'}
                </span>
                <span className="font-medium">{activeCategory.name}</span>
              </Link>
            </div>
            <h2 className="text-lg font-semibold mb-4">Alt Kategoriler</h2>
            {searchTerm.trim() && filterSubCategories(activeCategory.subcategories)?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Aradığınız kriterlere uygun alt kategori bulunamadı.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Aramayı temizle
                </button>
              </div>
            ) : (
              <ul className="space-y-1" role="list">
                {filterSubCategories(activeCategory.subcategories)?.map((subcategory) => {
                  const isSubActive = currentSubcategory === subcategory.slug;
                const hasSubSubcategories = subcategory.subcategories && subcategory.subcategories.length > 0;
                
                return (
                  <li key={`${activeCategory.slug}-${subcategory.slug}`} role="listitem" className="mb-1">
                    <Link
                      href={`/kategori/${activeCategory.slug}/${subcategory.slug}`}
                      prefetch={false}
                      className={`block px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                        isSubActive
                          ? "bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      aria-current={isSubActive ? "page" : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {typeof subcategory.icon === 'string' ? subcategory.icon : '•'}
                        </span>
                        <span className="flex-1">{subcategory.name}</span>
                        {hasSubSubcategories && (
                          <span className="text-xs text-gray-400">▼</span>
                        )}
                      </div>
                    </Link>
                    
                    {/* Alt-alt kategoriler */}
                    {hasSubSubcategories && subcategory.subcategories && (
                      <ul className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-3" role="list">
                        {subcategory.subcategories.map((subsubcategory) => {
                          const isSubSubActive = currentSubSubcategory === subsubcategory.slug;
                          
                          return (
                            <li key={`${activeCategory.slug}-${subcategory.slug}-${subsubcategory.slug}`} role="listitem">
                              <Link
                                href={`/kategori/${activeCategory.slug}/${subcategory.slug}/${subsubcategory.slug}`}
                                className={`block px-2 py-1.5 text-xs rounded transition-all duration-200 ${
                                  isSubSubActive
                                    ? "bg-blue-50 text-blue-600 font-medium border-l-2 border-blue-400"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                }`}
                                aria-current={isSubSubActive ? "page" : undefined}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">
                                    {typeof subsubcategory.icon === 'string' ? subsubcategory.icon : '•'}
                                  </span>
                                  <span>{subsubcategory.name}</span>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
              </ul>
            )}
            {searchTerm.trim() && filterSubCategories(activeCategory.subcategories) && filterSubCategories(activeCategory.subcategories)!.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                {filterSubCategories(activeCategory.subcategories)!.length} alt kategori bulundu
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">Alt kategori bulunamadı</div>
        )
      )}
      </nav>
    </>
  )
} 
