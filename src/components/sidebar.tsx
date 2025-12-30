"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { categories } from "@/lib/categories"
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
  MoreHorizontal
} from "lucide-react"

const categoryIcons = {
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

const categoryColors = {
  is: "text-blue-500",
  hizmetler: "text-green-500",
  elektronik: "text-blue-500",
  "ev-ve-bahce": "text-orange-500",
  giyim: "text-purple-500",
  "moda-stil": "text-purple-500",
  "sporlar-oyunlar-eglenceler": "text-orange-500",
  "anne-bebek": "text-pink-500",
  "cocuk-dunyasi": "text-pink-500",
  "egitim-kurslar": "text-indigo-500",
  "yemek-icecek": "text-yellow-500",
  "catering-ticaret": "text-emerald-500",
  "turizm-konaklama": "text-cyan-500",
  "saglik-guzellik": "text-red-500",
  "sanat-hobi": "text-purple-500",
  "ucretsiz-gel-al": "text-green-500"
}

export const Sidebar = () => {
  const pathname = usePathname()
  
  // Pathname'i parse et: /kategori/hizmetler/guvenlik -> ['kategori', 'hizmetler', 'guvenlik']
  const pathSegments = pathname?.split("/").filter(Boolean) || []
  
  // URL yapısını kontrol et
  const isCategoryRoute = pathSegments[0] === 'kategori'
  const currentCategory = isCategoryRoute ? pathSegments[1] : undefined
  const currentSubcategory = isCategoryRoute && pathSegments.length >= 3 ? pathSegments[2] : undefined
  
  // Alt kategori sayfası kontrolü: /kategori/[slug]/[subSlug] veya /kategori/[slug]/[subSlug]/[subsubslug]
  const isSubCategoryPage = isCategoryRoute && currentSubcategory !== undefined && currentSubcategory !== ''

  // Aktif kategoriyi bul
  const activeCategory = currentCategory ? categories.find(cat => cat.slug === currentCategory) : undefined

  // Alt-alt kategori kontrolü
  const currentSubSubcategory = isCategoryRoute && pathSegments.length >= 4 ? pathSegments[3] : undefined

  return (
    <nav className="w-64 bg-white p-4 border-r" aria-label="Kategoriler menüsü">
      {!isSubCategoryPage ? (
        // Ana kategori sayfasında: O kategorinin alt kategorilerini göster
        activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Alt Kategoriler</h2>
            <ul className="space-y-1" role="list">
              {activeCategory.subcategories.map((subcategory) => {
                const hasSubSubcategories = subcategory.subcategories && subcategory.subcategories.length > 0;
                
                return (
                  <li key={`${activeCategory.slug}-${subcategory.slug}`} role="listitem" className="mb-1">
                    <Link
                      href={`/kategori/${activeCategory.slug}/${subcategory.slug}`}
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
          </>
        ) : (
          // Alt kategorisi yoksa ana kategorileri göster
          <>
            <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
            <ul className="space-y-2" role="list">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || MoreHorizontal;
                const iconColor = categoryColors[category.slug as keyof typeof categoryColors] || "text-slate-500";
                const isActive = currentCategory === category.slug;
                
                return (
                  <li key={category.slug} role="listitem">
                    <Link
                      href={`/kategori/${category.slug}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50 hover:translate-x-1"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={`${category.name} kategorisini görüntüle`}
                    >
                      <IconComponent className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-blue-600" : iconColor}`} aria-hidden="true" />
                      <span>{category.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
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
            <ul className="space-y-1" role="list">
              {activeCategory.subcategories.map((subcategory) => {
                const isSubActive = currentSubcategory === subcategory.slug;
                const hasSubSubcategories = subcategory.subcategories && subcategory.subcategories.length > 0;
                
                return (
                  <li key={`${activeCategory.slug}-${subcategory.slug}`} role="listitem" className="mb-1">
                    <Link
                      href={`/kategori/${activeCategory.slug}/${subcategory.slug}`}
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
          </>
        ) : (
          <div className="text-sm text-gray-500">Alt kategori bulunamadı</div>
        )
      )}
    </nav>
  )
} 
