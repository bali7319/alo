'use client'

import Link from 'next/link'
import { MapPin, Phone, ExternalLink, Pill } from 'lucide-react'
import { CANAKKALE_ILCELER } from '@/lib/canakkale-seo'
import type { NobetciEczane } from '@/lib/nobetci-eczane'
import { NOBETCI_SPONSORLU_LINKS, NOBETCI_BANNER_LINKS } from '@/lib/nobetci-eczane'
import { useState, useMemo } from 'react'

/** Dizi kopyasını karıştırır (dönüşümlü gösterim için). */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Google Haritalar'da hedefe yol tarifi açar (telefonda navigasyon uygulaması açılır). */
function getGoogleMapsDirectionsUrl(mapQuery: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}&travelmode=driving`
}

/** Yeni sekmede açar ve doğrudan ekrana getirir (odak yeni sekmede). */
function openMapsAndFocus(url: string) {
  const w = window.open(url, '_blank', 'noopener')
  if (w) w.focus()
}

function getTelUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `tel:${digits.length >= 10 ? '+' : ''}${digits}`
}

export function NobetciEczaneModule({
  eczaneler,
  defaultIlceSlug,
}: {
  eczaneler: NobetciEczane[]
  defaultIlceSlug?: string
}) {
  const [ilceSlug, setIlceSlug] = useState<string>(defaultIlceSlug ?? '')

  const filtered = useMemo(() => {
    if (!ilceSlug) return eczaneler
    return eczaneler.filter((e) => e.ilceSlug === ilceSlug)
  }, [eczaneler, ilceSlug])

  /** İlanlardan dönüşümlü: her mount’ta 6 rastgele banner. */
  const bannerItems = useMemo(
    () => shuffle([...NOBETCI_BANNER_LINKS]).slice(0, 6),
    []
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="nobetci-ilce" className="text-sm font-medium text-gray-700">
          İlçe Seçin
        </label>
        <select
          id="nobetci-ilce"
          value={ilceSlug}
          onChange={(e) => setIlceSlug(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          aria-label="Nöbetçi eczane ilçe seçimi"
        >
          <option value="">Çanakkale – Tüm ilçeler</option>
          {CANAKKALE_ILCELER.map((ilce) => (
            <option key={ilce.slug} value={ilce.slug}>
              {ilce.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-4" role="list">
        {filtered.length === 0 ? (
          <li className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Bu ilçe için şu an nöbetçi eczane bilgisi bulunmuyor. Lütfen Eczacı Odası veya 113’ü arayın.
          </li>
        ) : (
          filtered.map((eczane) => (
            <li
              key={eczane.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                  Nöbetçi
                </span>
                <h3 className="font-bold text-gray-900">{eczane.name}</h3>
              </div>
              <p className="mb-2 flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden />
                <a
                  href={getGoogleMapsDirectionsUrl(eczane.mapQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault()
                    openMapsAndFocus(getGoogleMapsDirectionsUrl(eczane.mapQuery))
                  }}
                  className="text-gray-700 hover:text-orange-600 hover:underline"
                  aria-label={`${eczane.address} – Google Haritalarda aç`}
                >
                  {eczane.address}
                </a>
              </p>
              <p className="mb-3 flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden />
                <a
                  href={getTelUrl(eczane.phone)}
                  className="font-medium text-orange-600 hover:underline"
                  aria-label={`Ara: ${eczane.phone}`}
                >
                  {eczane.phone}
                </a>
              </p>
              <a
                href={getGoogleMapsDirectionsUrl(eczane.mapQuery)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault()
                  openMapsAndFocus(getGoogleMapsDirectionsUrl(eczane.mapQuery))
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Google Haritalarda Aç / Yol Tarifi
              </a>
            </li>
          ))
        )}
      </ul>

      {/* İlanlardan dönüşümlü banner reklamları – eczane listesi altı */}
      <section aria-labelledby="nobetci-banner-heading" className="pt-2">
        <h2 id="nobetci-banner-heading" className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Siteden öne çıkanlar
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {bannerItems.map((item) => (
            <Link
              key={`${item.href}-${item.title}`}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/50 hover:shadow"
            >
              <span className="flex-1 text-sm font-medium text-gray-800 group-hover:text-orange-700">
                {item.title}
              </span>
              {item.tag && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {item.tag}
                </span>
              )}
              <span className="text-orange-500 opacity-0 transition group-hover:opacity-100" aria-hidden>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sponsorlu metin linkleri */}
      <div className="rounded-lg border border-orange-100 bg-orange-50/50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-700">
          Sponsorlu
        </p>
        <ul className="space-y-2">
          {NOBETCI_SPONSORLU_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block text-sm text-gray-700 hover:text-orange-600 hover:underline"
              >
                <span className="font-medium">{item.description}</span>{' '}
                <span className="text-orange-600">{item.label} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Sidebar / mobil için kompakt widget: ikon + link. */
export function NobetciEczaneWidget() {
  return (
    <Link
      href="/nobetci-eczane"
      className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/80 px-3 py-2.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-100 hover:border-green-300"
      aria-label="Çanakkale nöbetçi eczaneler sayfasına git"
    >
      <Pill className="h-5 w-5 flex-shrink-0 text-green-600" aria-hidden />
      <span>Nöbetçi Eczane</span>
    </Link>
  )
}
