'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Star, Eye, Clock, Camera, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { SearchBar } from '@/components/search-bar'

// Lazy load components
const Sidebar = dynamic(() => import("@/components/sidebar").then(mod => ({ default: mod.Sidebar })), {
  loading: () => <div className="w-full md:w-64 h-64 bg-gray-100 animate-pulse rounded-lg" />
})
const FeaturedAds = dynamic(() => import('@/components/featured-ads').then(mod => ({ default: mod.FeaturedAds })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
})
const LatestAds = dynamic(() => import('@/components/latest-ads').then(mod => ({ default: mod.LatestAds })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
})

export default function HomePageContent() {
  const [featuredListings, setFeaturedListings] = useState<any[]>([])
  const [latestListings, setLatestListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Client-side'da API'den veri çek
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/listings/homepage', {
          cache: 'no-store',
        })
        const data = await response.json()
        setFeaturedListings(data.featuredListings || [])
        setLatestListings(data.latestListings || [])
      } catch (error) {
        console.error('Listings fetch error:', error)
        setFeaturedListings([])
        setLatestListings([])
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-8 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 px-2">
              Ücretsiz İlan Platformu
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 px-2">
              Elektronik, giyim, ev eşyaları ve daha birçok kategoride ilan ver, keşfet veya satın al.
            </p>
          </div>
        </div>
      </section>

      {/* Arama Container - Banner Altında */}
      <section className="bg-white border-b py-4 md:py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <SearchBar />
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Sol Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            {/* Reklam Ver Butonu - Kategorilerin Üstünde */}
            <div className="mb-4">
              <Link href="/premium">
                <button className="w-full flex items-center justify-center px-4 py-2.5 md:py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-sm md:text-base font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg">
                  <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Reklam Ver
                </button>
              </Link>
            </div>
            <Sidebar />
          </div>

          {/* Ana İçerik */}
          <div className="flex-1 space-y-8">
            {loading ? (
              <>
                <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
                <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
              </>
            ) : (
              <>
                <section>
                  <FeaturedAds 
                    title="Öne Çıkan İlanlar" 
                    listings={featuredListings}
                  />
                </section>
                
                <section>
                  <LatestAds 
                    title="Son Eklenen İlanlar" 
                    listings={latestListings}
                  />
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Premium Avantajları Section */}
      <section className="bg-gradient-to-r from-orange-500 to-yellow-500 py-8 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 px-2">
              Premium Avantajları
            </h2>
            <p className="text-lg md:text-xl text-orange-100 mb-4 md:mb-6 px-2">
              İlanlarınızı Öne Çıkarın, Daha Hızlı Satın
            </p>
            <p className="text-sm sm:text-base md:text-lg text-orange-100 max-w-3xl mx-auto px-2">
              Premium ilanlar, standart ilanlara göre %70 daha fazla görüntülenir ve %40 daha hızlı satılır. 
              Üstelik premium özelliklerle yayında kalır ve 5 adete kadar fotoğraf ekleyebilirsiniz.
            </p>
          </div>

          {/* Premium Özellikler Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">%70 Daha Fazla Görüntülenme</h3>
              <p className="text-orange-100">İlanınız daha fazla kişi tarafından görülür</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">%40 Daha Hızlı Satış</h3>
              <p className="text-orange-100">İlanınız daha kısa sürede satılır</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Premium Yayın</h3>
              <p className="text-orange-100">İlanınız premium özelliklerle yayında kalır</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">5 Fotoğraf</h3>
              <p className="text-orange-100">5 adete kadar fotoğraf ekleyebilirsiniz</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/premium"
              className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-lg"
            >
              <Star className="h-5 w-5 mr-2" />
              Premium Avantajlarını Keşfet
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

