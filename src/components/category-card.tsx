'use client'

import Link from 'next/link'

interface CategoryCardProps {
  name: string
  slug: string
  icon: any
  subcategories?: Array<{
    name: string
    slug: string
    icon: string
  }>
  color?: string
}

export function CategoryCard({ name, slug, icon, subcategories, color = "text-blue-500" }: CategoryCardProps) {
  const Icon = icon;
  return (
    <Link href={`/kategori/${slug}`} className="group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className={`text-2xl ${color}`}>
            {typeof icon === 'string' ? icon : Icon ? <Icon /> : null}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
        </div>
        
        {subcategories && subcategories.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm text-gray-500 mb-2">Popüler kategoriler:</p>
            <div className="flex flex-wrap gap-1">
              {subcategories.slice(0, 3).map((sub) => (
                <span
                  key={sub.slug}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
                >
                  {sub.name}
                </span>
              ))}
              {subcategories.length > 3 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                  +{subcategories.length - 3} daha
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
} 
