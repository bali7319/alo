import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { WhyUsHero } from '@/components/home/WhyUsHero'
import { AdvantageBand } from '@/components/home/AdvantageBand'
import { DifferenceInline } from '@/components/home/DifferenceSidebar'
import { CityStory } from '@/components/home/CityStory'
import SeoJsonLd from '@/components/SeoJsonLd'
import { HomeListingsSection } from './HomeListingsSection'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://alo17.tr/',
  },
}

export const revalidate = 60

export default function Home() {
  const baseUrl = 'https://alo17.tr'
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Alo17',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.svg`,
    sameAs: [],
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Alo17',
    url: baseUrl,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured data (JSON-LD) for SEO */}
      <SeoJsonLd id="ld-org" data={orgJsonLd} />
      <SeoJsonLd id="ld-website" data={websiteJsonLd} />

      {/* Search bar - Above-the-fold */}
      <section className="bg-white border-b py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse rounded-lg" />}>
            <SearchBar />
          </Suspense>

          {/* CTA: İlan Ver (Search bar altı) */}
          <div className="mt-4 flex justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold shadow-lg"
            >
              <Link href="/ilan-ver">İlan Ver</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Hero (welcome) - right after logos/search, before listings */}
      <WhyUsHero />
      <section className="container mx-auto px-3 sm:px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <DifferenceInline />
        </div>
      </section>
      <section className="container mx-auto px-3 sm:px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <AdvantageBand />
        </div>
      </section>

      {/* İlan listesi: stream ile yüklenir, anında skeleton gösterilir */}
      <Suspense
        fallback={
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col lg:flex-row gap-6">
            <div className="w-full md:w-64 flex-shrink-0 space-y-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="w-full md:w-64 h-64 rounded-lg" />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          </div>
        }
      >
        <HomeListingsSection />
      </Suspense>

      <CityStory />
    </div>
  );
}
