'use client'

import { FaFutbol, FaBasketballBall, FaVolleyballBall, FaHockeyPuck, FaSwimmingPool, FaRunning, FaDumbbell, FaMountain, FaSnowflake, FaBowlingBall } from 'react-icons/fa'
import Link from 'next/link'
import { useState } from 'react'

const subcategories = [
  { id: 'takim-sporlari', name: 'Takım Sporları', icon: <FaFutbol className="inline mr-2 text-blue-500" /> },
  { id: 'bireysel-sporlar', name: 'Bireysel Sporlar', icon: <FaRunning className="inline mr-2 text-blue-500" /> },
  { id: 'su-sporlari', name: 'Su Sporları', icon: <FaSwimmingPool className="inline mr-2 text-blue-500" /> },
  { id: 'kis-sporlari', name: 'Kış Sporları', icon: <FaSnowflake className="inline mr-2 text-blue-500" /> },
  { id: 'doga-sporlari', name: 'Doğa Sporları', icon: <FaMountain className="inline mr-2 text-blue-500" /> },
  { id: 'salon-fitness', name: 'Salon & Fitness Sporları', icon: <FaDumbbell className="inline mr-2 text-blue-500" /> },
]

export default function SporAktiviteleriPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Spor Aktiviteleri</h1>
        <p className="text-gray-600 mt-2">
          Spor aktiviteleri, ekipmanlar ve malzemeler için ilanları keşfedin
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
                    href={`/kategori/sporlar-oyunlar-eglenceler/spor-aktiviteleri/${subcategory.id}`}
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
