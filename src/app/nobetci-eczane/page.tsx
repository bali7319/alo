import { Metadata } from 'next'
import Link from 'next/link'
import { Pill, MapPin } from 'lucide-react'
import {
  getNobetciEczaneler,
  getNobetciEczanelerFromDb,
  getNobetciTarihMetin,
} from '@/lib/nobetci-eczane'
import { NobetciEczaneModule } from '@/components/NobetciEczaneModule'
import SeoJsonLd from '@/components/SeoJsonLd'
import { CANAKKALE_ILCELER } from '@/lib/canakkale-seo'

export const revalidate = 3600 // 1 saat; gerçekte cron 18:00'de güncelleyebilir

export async function generateMetadata(): Promise<Metadata> {
  const tarih = getNobetciTarihMetin()
  const title = `${tarih} Çanakkale Nöbetçi Eczaneleri - alo17.tr`
  const description =
    "Çanakkale Merkez ve ilçelerde bugünün nöbetçi eczaneleri. Adres, telefon ve yol tarifi. Biga, Gelibolu, Çan, Lapseki nöbetçi eczane listesi güncel."

  return {
    title,
    description,
    openGraph: { title, description, url: 'https://alo17.tr/nobetci-eczane', type: 'website' },
    alternates: { canonical: 'https://alo17.tr/nobetci-eczane' },
  }
}

export default async function NobetciEczanePage() {
  const fromDb = await getNobetciEczanelerFromDb()
  const eczaneler = fromDb.length > 0 ? fromDb : getNobetciEczaneler()
  const tarih = getNobetciTarihMetin()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${tarih} Çanakkale Nöbetçi Eczaneleri`,
    description: "Çanakkale ve ilçelerinde bugünün nöbetçi eczaneleri listesi.",
    url: 'https://alo17.tr/nobetci-eczane',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: eczaneler.slice(0, 15).map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Pharmacy',
          name: e.name,
          address: { '@type': 'PostalAddress', streetAddress: e.address },
          telephone: e.phone,
        },
      })),
    },
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-orange-600">
            Ana Sayfa
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Nöbetçi Eczane</span>
        </nav>

        <header className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            <Pill className="h-8 w-8 text-green-600" aria-hidden />
            Çanakkale Nöbetçi Eczaneler
          </h1>
          <p className="mt-2 text-gray-600">
            <time dateTime={new Date().toISOString().split('T')[0]}>{tarih}</time> tarihli nöbetçi
            eczane listesi. İlçe seçerek adres, telefon ve yol tarifine ulaşabilirsiniz.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <section
            className="rounded-xl border border-gray-200 bg-white p-6"
            aria-labelledby="nobetci-listesi-heading"
          >
            <h2 id="nobetci-listesi-heading" className="sr-only">
              Nöbetçi eczane listesi
            </h2>
            <NobetciEczaneModule eczaneler={eczaneler} />
          </section>

          <aside className="lg:order-first">
            <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 font-semibold text-gray-900">İlçelere Göre</h2>
              <ul className="space-y-1 text-sm">
                {CANAKKALE_ILCELER.map((ilce) => (
                  <li key={ilce.slug}>
                    <Link
                      href={`/nobetci-eczane/${ilce.slug}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
                    >
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {ilce.name} nöbetçi eczaneler
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <p className="mt-8 text-xs text-gray-500">
          Nöbetçi eczane bilgileri bilgilendirme amaçlıdır. Resmi liste için Çanakkale Eczacı Odası
          veya 113 hattını kullanın.
        </p>
      </div>
      <SeoJsonLd id="ld-nobetci-eczane" data={jsonLd} />
    </main>
  )
}
