'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/sidebar"
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import { listings } from '@/lib/listings'
import { Star, Eye, Clock, Camera, TrendingUp } from 'lucide-react'
import Link from 'next/link'

// SEO için metadata layout.tsx'te tanımlı
export default function Home() {
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [latestListings, setLatestListings] = useState<any[]>([]);

  useEffect(() => {
    // Static verileri hazırla
    const staticListings = listings.filter(listing => listing.isPremium).slice(0, 6);
    const staticLatestListings = [...listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12);

    // localStorage'dan kullanıcı ilanlarını al
    let userListings: any[] = [];
    try {
      userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
    } catch (error) {
      console.error('localStorage okuma hatası:', error);
      userListings = [];
    }

    // Premium ilanları birleştir (kullanıcı ilanları önce)
    const featured = [
      ...userListings.filter(listing => listing.isPremium),
      ...staticListings
    ].slice(0, 6);

    // En yeni ilanları birleştir (kullanıcı ilanları önce)
    const latest = [
      ...userListings,
      ...staticLatestListings
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12);

    setFeaturedListings(featured);
    setLatestListings(latest);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Alo17",
            "url": "https://alo17.tr",
            "description": "Çanakkale'nin en büyük ilan sitesi",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://alo17.tr/ilanlar?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ücretsiz İlan Platformu
            </h1>
            <p className="text-xl text-blue-100">
              Elektronik, giyim, ev eşyaları ve daha birçok kategoride ilan ver, keşfet veya satın al.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sol Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar />
          </div>

          {/* Ana İçerik */}
          <div className="flex-1 space-y-8">
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
          </div>
        </div>
      </div>

      {/* Premium Avantajları Section */}
      <section className="bg-gradient-to-r from-orange-500 to-yellow-500 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Premium Avantajları
            </h2>
            <p className="text-xl text-orange-100 mb-6">
              İlanlarınızı Öne Çıkarın, Daha Hızlı Satın
            </p>
            <p className="text-lg text-orange-100 max-w-3xl mx-auto">
              Premium ilanlar, standart ilanlara göre %70 daha fazla görüntülenir ve %40 daha hızlı satılır. 
              Üstelik premium özelliklerle yayında kalır ve 5 adete kadar fotoğraf ekleyebilirsiniz.
            </p>
          </div>

          {/* Premium Özellikler Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
    </main>
  )
} 
