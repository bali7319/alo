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
  const isCategoryPage = pathname?.startsWith("/kategori/") || false
  const currentPath = pathname?.split("/").filter(Boolean) || []
  const currentCategory = currentPath[1]
  const currentSubcategory = currentPath[2]

  return (
    <nav className="w-64 bg-white p-4 border-r" aria-label="Kategoriler menüsü">
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
              {isCategoryPage &&
                isActive &&
                category.subcategories && (
                  <ul className="ml-4 mt-1 space-y-1" role="list" aria-label={`${category.name} alt kategorileri`}>
                    {category.subcategories.map((subcategory) => {
                      const isSubActive = currentSubcategory === subcategory.slug;
                      return (
                        <li key={subcategory.slug} role="listitem">
                          <Link
                            href={`/kategori/${category.slug}/${subcategory.slug}`}
                            className={`block px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                              isSubActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:translate-x-1"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                            aria-current={isSubActive ? "page" : undefined}
                            aria-label={`${subcategory.name} alt kategorisini görüntüle`}
                          >
                            {subcategory.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
} 
