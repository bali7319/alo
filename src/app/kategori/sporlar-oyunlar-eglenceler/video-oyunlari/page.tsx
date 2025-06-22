'use client'

import { FaGamepad, FaPlaystation, FaXbox } from 'react-icons/fa'
import { SiNintendoswitch } from 'react-icons/si'
import Link from 'next/link'
import { useState } from 'react'

const subcategories = [
  { id: 'playstation', name: 'PlayStation', icon: <FaPlaystation className="inline mr-2 text-blue-500" /> },
  { id: 'xbox', name: 'Xbox', icon: <FaXbox className="inline mr-2 text-blue-500" /> },
  { id: 'nintendo', name: 'Nintendo', icon: <SiNintendoswitch className="inline mr-2 text-blue-500" /> },
  { id: 'pc-oyunlari', name: 'PC Oyunları', icon: <FaGamepad className="inline mr-2 text-blue-500" /> },
]

export default function VideoOyunlariPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Video Oyunları</h1>
        <p className="text-gray-600 mt-2">
          Konsol ve PC oyunları için ilanları keşfedin
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Kategoriler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
              <div className="space-y-2">
                {subcategories.map(subcategory => (
                  <Link
                    key={subcategory.id}
                    href={`/kategori/sporlar-oyunlar-eglenceler/video-oyunlari/${subcategory.id}`}
                    onClick={() => setSelectedSubcategory(subcategory.id)}
                    className={`block px-3 py-2 rounded-md hover:bg-gray-100 ${
                      selectedSubcategory === subcategory.id ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    {subcategory.icon}{subcategory.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
