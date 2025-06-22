'use client'

import { FaFutbol, FaSwimmingPool, FaRunning, FaDumbbell, FaMountain, FaSnowflake, FaCar } from 'react-icons/fa'
import { GiTennisBall, GiBoxingGlove } from 'react-icons/gi'
import Link from 'next/link'

const categories = [
  { id: 'takim-sporlari', name: 'Takım Sporları', icon: <FaFutbol className="text-green-500" /> },
  { id: 'raket-sporlari', name: 'Raket Sporları', icon: <GiTennisBall className="text-yellow-500" /> },
  { id: 'su-sporlari', name: 'Su Sporları', icon: <FaSwimmingPool className="text-blue-500" /> },
  { id: 'atletizm', name: 'Atletizm & Koşu', icon: <FaRunning className="text-red-500" /> },
  { id: 'fitness', name: 'Fitness & Vücut Geliştirme', icon: <FaDumbbell className="text-gray-700" /> },
  { id: 'doga-sporlari', name: 'Doğa Sporları', icon: <FaMountain className="text-green-700" /> },
  { id: 'kis-sporlari', name: 'Kış Sporları', icon: <FaSnowflake className="text-blue-300" /> },
  { id: 'dovus-sporlari', name: 'Dövüş Sporları', icon: <GiBoxingGlove className="text-red-700" /> },
  { id: 'motorsporlari', name: 'Motorsporları', icon: <FaCar className="text-gray-900" /> }
]

export default function SporDallariPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Spor Aktiviteleri</h1>
        <p className="text-gray-600 mt-2">
          Spor aktiviteleri, ekipmanlar ve malzemeler için ilanları keşfedin
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <Link
            key={category.id}
            href={`/kategori/sporlar-oyunlar-eglenceler/spor-dallari/${category.id}`}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">
                {category.icon}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {category.name}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 
