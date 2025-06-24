"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { categories } from "@/lib/categories"

const categoryColors = {
  elektronik: "text-blue-500",
  "bilgisayarlar-ofis-ekipmanlari": "text-indigo-500",
  "ev-bahce": "text-orange-500",
  giyim: "text-purple-500",
  "anne-bebek": "text-pink-500",
  "spor-oyunlar-eglenceler": "text-emerald-500",
  "egitim-kurslar": "text-cyan-500",
  "yemek-icecek": "text-amber-500",
  "turizm-gecelemeler": "text-teal-500",
  "saglik-guzellik": "text-rose-500",
  "sanat-hobi": "text-violet-500",
  "ucretsiz-gel-al": "text-lime-500",
  diger: "text-slate-500"
}

export const Sidebar = () => {
  const pathname = usePathname()
  const isCategoryPage = pathname?.startsWith("/kategori/") || false
  const currentPath = pathname?.split("/").filter(Boolean) || []
  const currentCategory = currentPath[1]
  const currentSubcategory = currentPath[2]

  return (
    <div className="w-64 bg-white p-4 border-r">
      <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
      <div className="space-y-2">
        {categories.map((category) => {
          const iconColor = categoryColors[category.slug as keyof typeof categoryColors]
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
                <span className={`text-lg ${currentCategory === category.slug ? "text-blue-600" : iconColor}`}>
                  {typeof category.icon === 'string' ? category.icon : '📦'}
                </span>
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
