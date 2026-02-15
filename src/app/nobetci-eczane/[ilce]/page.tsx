import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pill, MapPin } from 'lucide-react'
import {
  getNobetciEczaneler,
  getNobetciEczanelerFromDb,
  getNobetciTarihMetin,
  isValidIlceSlug,
} from '@/lib/nobetci-eczane'
import { NobetciEczaneModule } from '@/components/NobetciEczaneModule'
import SeoJsonLd from '@/components/SeoJsonLd'
import { CANAKKALE_ILCELER } from '@/lib/canakkale-seo'

export const revalidate = 3600

export async function generateStaticParams() {
  return CANAKKALE_ILCELER.map((ilce) => ({ ilce: ilce.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ilce: string }>
}): Promise<Metadata> {
  const { ilce } = await params
  if (!isValidIlceSlug(ilce)) return { title: 'Sayfa Bulunamadı' }

  const ilceInfo = CANAKKALE_ILCELER.find((i) => i.slug === ilce)!
  const tarih = getNobetciTarihMetin()
  const title = `${tarih} ${ilceInfo.name} Nöbetçi Eczaneleri - alo17.tr`
  const description = `${ilceInfo.name} ilçesinde bugünün nöbetçi eczaneleri. Adres, telefon ve Google Harita yol tarifi. Çanakkale nöbetçi eczane listesi.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://alo17.tr/nobetci-eczane/${ilce}`,
      type: 'website',
    },
    alternates: { canonical: `https://alo17.tr/nobetci-eczane/${ilce}` },
  }
}

export default async function NobetciEczaneIlcePage({
  params,
}: {
  params: Promise<{ ilce: string }>
}) {
  const { ilce } = await params
  if (!isValidIlceSlug(ilce)) notFound()

  const ilceInfo = CANAKKALE_ILCELER.find((i) => i.slug === ilce)!
  const fromDb = await getNobetciEczanelerFromDb()
  const eczanelerTum =
    fromDb.length > 0 ? fromDb : getNobetciEczaneler()
  const eczanelerIlce =
    fromDb.length > 0
      ? eczanelerTum.filter((e) => e.ilceSlug === ilce)
      : getNobetciEczaneler(ilce)
  const tarih = getNobetciTarihMetin()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${tarih} ${ilceInfo.name} Nöbetçi Eczaneleri`,
    description: `${ilceInfo.name} ilçesinde bugünün nöbetçi eczaneleri.`,
    url: `https://alo17.tr/nobetci-eczane/${ilce}`,
    dateModified: new Date().toISOString().split('T')[0],
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: eczanelerIlce.map((e, i) => ({
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
          <Link href="/nobetci-eczane" className="hover:text-orange-600">
            Nöbetçi Eczane
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{ilceInfo.name}</span>
        </nav>

        <header className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            <Pill className="h-8 w-8 text-green-600" aria-hidden />
            {ilceInfo.name} Nöbetçi Eczaneler
          </h1>
          <p className="mt-2 text-gray-600">
            <time dateTime={new Date().toISOString().split('T')[0]}>{tarih}</time> – {ilceInfo.name}{' '}
            ilçesindeki nöbetçi eczaneler. Adres, telefon ve yol tarifi aşağıda.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <section
            className="rounded-xl border border-gray-200 bg-white p-6"
            aria-labelledby="nobetci-listesi-heading"
          >
            <h2 id="nobetci-listesi-heading" className="sr-only">
              {ilceInfo.name} nöbetçi eczane listesi
            </h2>
            <NobetciEczaneModule eczaneler={eczanelerTum} defaultIlceSlug={ilce} />
          </section>

          <aside className="lg:order-first">
            <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 font-semibold text-gray-900">Diğer İlçeler</h2>
              <ul className="space-y-1 text-sm">
                {CANAKKALE_ILCELER.filter((i) => i.slug !== ilce).map((i) => (
                  <li key={i.slug}>
                    <Link
                      href={`/nobetci-eczane/${i.slug}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
                    >
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {i.name} nöbetçi eczaneler
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/nobetci-eczane"
                    className="flex items-center gap-2 font-medium text-orange-600 hover:underline"
                  >
                    Tüm ilçeler
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <p className="mt-8 text-xs text-gray-500">
          Nöbetçi eczane bilgileri bilgilendirme amaçlıdır. Resmi liste için Çanakkale Eczacı Odası
          veya 113 hattını kullanın.
        </p>
      </div>
      <SeoJsonLd id="ld-nobetci-eczane-ilce" data={jsonLd} />
    </main>
  )
}
