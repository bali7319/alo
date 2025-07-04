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
  "anne-bebek": Baby,
  "cocuk-dunyasi": Baby,
  "egitim-kurslar": GraduationCap,
  "yemek-icecek": Utensils,
  "catering-ticaret": Store,
  "turizm-konaklama": Hotel,
  "saglik-guzellik": Heart,
  "sanat-hobi": Palette,
  "ucretsiz-gel-al": Gift,
  diger: MoreHorizontal
}

const categoryColors = {
  is: "text-blue-500",
  hizmetler: "text-green-500",
  elektronik: "text-blue-500",
  "ev-ve-bahce": "text-orange-500",
  giyim: "text-purple-500",
  "moda-stil": "text-purple-500",
  "anne-bebek": "text-pink-500",
  "cocuk-dunyasi": "text-pink-500",
  "egitim-kurslar": "text-indigo-500",
  "yemek-icecek": "text-yellow-500",
  "catering-ticaret": "text-emerald-500",
  "turizm-konaklama": "text-cyan-500",
  "saglik-guzellik": "text-red-500",
  "sanat-hobi": "text-purple-500",
  "ucretsiz-gel-al": "text-green-500",
  diger: "text-slate-500"
}

export const Sidebar = () => {
  const pathname = usePathname()
  const isCategoryPage = pathname?.startsWith("/kategori/") || false
  const currentPath = pathname?.split("/").filter(Boolean) || []
  const currentCategory = currentPath[1]
  const currentSubcategory = currentPath[2]

  console.log("Categories:", categories.map(c => ({ name: c.name, slug: c.slug })))
  console.log("Category Icons:", Object.keys(categoryIcons))

  return (
    <div className="w-64 bg-white p-4 border-r">
      <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
      <div className="space-y-2">
        {categories.map((category) => {
          const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || MoreHorizontal;
          const iconColor = categoryColors[category.slug as keyof typeof categoryColors] || "text-slate-500";
          
          console.log(`Category: ${category.name}, Slug: ${category.slug}, Icon: ${IconComponent.name}`)
          
          return (
            <div key={category.slug}>
              <Link
                href={`/kategori/${category.slug}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  currentCategory === category.slug
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <IconComponent className={`w-5 h-5 ${currentCategory === category.slug ? "text-blue-600" : iconColor}`} />
                <span>{category.name}</span>
              </Link>
              {isCategoryPage &&
                currentCategory === category.slug &&
                category.subcategories && (
                  <div className="ml-4 mt-1 space-y-1">
                    {category.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={`/kategori/${category.slug}/${subcategory.slug}`}
                        className={`block px-3 py-1.5 text-sm rounded-md ${
                          currentSubcategory === subcategory.slug
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 
