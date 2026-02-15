/**
 * Nöbetçi Eczane modülü – veri yapısı ve erişim.
 *
 * MİMARİ:
 * - Veri: Prisma modeli NobetciEczaneRecord (validForDate = YYYY-MM-DD, ilceSlug, name, address, phone, mapQuery).
 * - Yazma: Cron GET/POST /api/cron/nobetci-eczane (18:30 TR = 15:30 UTC); getNobetciEczaneKaynakForCron() → DB.
 * - Okuma: Sayfalar getNobetciEczanelerFromDb() ile DB'den okur; boşsa getNobetciEczaneler() mock.
 * - UI: app/nobetci-eczane, app/nobetci-eczane/[ilce] (server); NobetciEczaneModule (client, list + banner + sponsorlu).
 * - Prisma bu dosyada sadece getNobetciEczanelerFromDb içinde dynamic import ile kullanılır; client bundle'a girmez.
 */

import { CANAKKALE_ILCELER } from './canakkale-seo'

export type IlceSlugNobetci = (typeof CANAKKALE_ILCELER)[number]['slug']

export interface NobetciEczane {
  id: string
  name: string
  address: string
  phone: string
  /** Google Haritalar'da arama için: "adres, Çanakkale" */
  mapQuery: string
  ilceSlug: IlceSlugNobetci
}

/**
 * Örnek / mock nöbetçi eczane verisi.
 * Canlı ortamda: API, Eczacı Odası scraper veya günlük cron ile doldurulmalı.
 */
const MOCK_NOBETCI_ECZANELER: NobetciEczane[] = [
  {
    id: '1',
    name: 'Can Eczanesi',
    address: 'Cevatpaşa Mah. Veli Reis Sok. No:12',
    phone: '0286 212 34 56',
    mapQuery: 'Cevatpaşa Mah. Veli Reis Sok. No:12, Çanakkale Merkez',
    ilceSlug: 'merkez',
  },
  {
    id: '2',
    name: 'Merkez Sağlık Eczanesi',
    address: 'İsmetpaşa Mah. Atatürk Cad. No:45',
    phone: '0286 217 12 34',
    mapQuery: 'İsmetpaşa Mah. Atatürk Cad. No:45, Çanakkale Merkez',
    ilceSlug: 'merkez',
  },
  {
    id: '3',
    name: 'Barbaros Nöbetçi Eczanesi',
    address: 'Barbaros Mah. Cumhuriyet Bulvarı No:8',
    phone: '0286 213 45 67',
    mapQuery: 'Barbaros Mah. Cumhuriyet Bulvarı, Çanakkale Merkez',
    ilceSlug: 'merkez',
  },
  {
    id: '4',
    name: 'Biga Merkez Eczanesi',
    address: 'Cumhuriyet Mah. İstasyon Cad. No:22',
    phone: '0286 316 12 34',
    mapQuery: 'Cumhuriyet Mah. İstasyon Cad. No:22, Biga Çanakkale',
    ilceSlug: 'biga',
  },
  {
    id: '5',
    name: 'Biga 17 Eczanesi',
    address: 'Yeni Mah. Fatih Sok. No:5',
    phone: '0286 316 56 78',
    mapQuery: 'Yeni Mah. Fatih Sok. No:5, Biga Çanakkale',
    ilceSlug: 'biga',
  },
  {
    id: '6',
    name: 'Çan Nöbetçi Eczanesi',
    address: 'Merkez Mah. Belediye Cad. No:15',
    phone: '0286 416 11 22',
    mapQuery: 'Merkez Mah. Belediye Cad. No:15, Çan Çanakkale',
    ilceSlug: 'can',
  },
  {
    id: '7',
    name: 'Gelibolu Sağlık Eczanesi',
    address: 'Fevzipaşa Mah. Sahil Yolu No:3',
    phone: '0286 566 12 34',
    mapQuery: 'Fevzipaşa Mah. Sahil Yolu No:3, Gelibolu Çanakkale',
    ilceSlug: 'gelibolu',
  },
  {
    id: '8',
    name: 'Lapseki Eczanesi',
    address: 'Merkez Mah. Çanakkale Cad. No:28',
    phone: '0286 512 34 56',
    mapQuery: 'Merkez Mah. Çanakkale Cad. No:28, Lapseki Çanakkale',
    ilceSlug: 'lapseki',
  },
  {
    id: '9',
    name: 'Ezine Merkez Eczanesi',
    address: 'Cumhuriyet Mah. Atatürk Sok. No:7',
    phone: '0286 616 22 33',
    mapQuery: 'Cumhuriyet Mah. Atatürk Sok. No:7, Ezine Çanakkale',
    ilceSlug: 'ezine',
  },
  {
    id: '10',
    name: 'Ayvacık Eczanesi',
    address: 'Merkez Mah. İlçe Jandarma Yanı',
    phone: '0286 712 34 56',
    mapQuery: 'Merkez Mah. Ayvacık Çanakkale',
    ilceSlug: 'ayvacik',
  },
  {
    id: '11',
    name: 'Bayramiç Nöbetçi Eczanesi',
    address: 'Merkez Mah. Hükümet Cad. No:12',
    phone: '0286 716 11 22',
    mapQuery: 'Merkez Mah. Hükümet Cad. No:12, Bayramiç Çanakkale',
    ilceSlug: 'bayramic',
  },
  {
    id: '12',
    name: 'Eceabat Eczanesi',
    address: 'Merkez Mah. Cumhuriyet Cad. No:9',
    phone: '0286 814 15 16',
    mapQuery: 'Merkez Mah. Cumhuriyet Cad. No:9, Eceabat Çanakkale',
    ilceSlug: 'eceabat',
  },
  {
    id: '13',
    name: 'Yenice Eczanesi',
    address: 'Merkez Mah. Atatürk Cad. No:4',
    phone: '0286 786 12 34',
    mapQuery: 'Merkez Mah. Atatürk Cad. No:4, Yenice Çanakkale',
    ilceSlug: 'yenice',
  },
  {
    id: '14',
    name: 'Gökçeada Eczanesi',
    address: 'Merkez Mah. Liman Cad. No:2',
    phone: '0286 887 10 20',
    mapQuery: 'Merkez Mah. Liman Cad. No:2, Gökçeada Çanakkale',
    ilceSlug: 'gokceada',
  },
  {
    id: '15',
    name: 'Bozcaada Eczanesi',
    address: 'Cumhuriyet Mah. Çarşı İçi No:1',
    phone: '0286 697 80 90',
    mapQuery: 'Cumhuriyet Mah. Çarşı İçi No:1, Bozcaada Çanakkale',
    ilceSlug: 'bozcaada',
  },
]

/** İlçe slug'ına göre nöbetçi eczaneleri döndürür. slug verilmezse tümü. */
export function getNobetciEczaneler(ilceSlug?: IlceSlugNobetci): NobetciEczane[] {
  if (!ilceSlug) return [...MOCK_NOBETCI_ECZANELER]
  return MOCK_NOBETCI_ECZANELER.filter((e) => e.ilceSlug === ilceSlug)
}

/** Cron'un veritabanına yazacağı kaynak liste. Şu an mock; gerçekte Eczacı Odası API/scraper bağlanabilir. */
export function getNobetciEczaneKaynakForCron(): NobetciEczane[] {
  return [...MOCK_NOBETCI_ECZANELER]
}

/** Türkiye saatine göre bugünün tarihi YYYY-MM-DD. */
export function getTodayTurkeyYYYYMMDD(): string {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(now)
  const year = parts.find((p) => p.type === 'year')!.value
  const month = parts.find((p) => p.type === 'month')!.value
  const day = parts.find((p) => p.type === 'day')!.value
  return `${year}-${month}-${day}`
}

/** Veritabanından bugünün nöbetçi eczane listesini döndürür. Boşsa [] (caller mock kullanabilir). */
export async function getNobetciEczanelerFromDb(
  ilceSlug?: IlceSlugNobetci
): Promise<NobetciEczane[]> {
  try {
    const { prisma } = await import('./prisma')
    const today = getTodayTurkeyYYYYMMDD()
    const rows = await prisma.nobetciEczaneRecord.findMany({
      where: {
        validForDate: today,
        ...(ilceSlug ? { ilceSlug } : {}),
      },
      orderBy: [{ ilceSlug: 'asc' }, { name: 'asc' }],
    })
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      phone: r.phone,
      mapQuery: r.mapQuery,
      ilceSlug: r.ilceSlug as IlceSlugNobetci,
    }))
  } catch {
    return []
  }
}

/** İlçe slug'ının geçerli olup olmadığını kontrol eder. */
export function isValidIlceSlug(slug: string): slug is IlceSlugNobetci {
  return CANAKKALE_ILCELER.some((i) => i.slug === slug)
}

/** Bugünün tarihini "15 Şubat 2026" formatında. */
export function getNobetciTarihMetin(): string {
  return new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Sponsorlu / dönüşüm linkleri – eczane sayfasında gösterilir. */
export const NOBETCI_SPONSORLU_LINKS: { label: string; href: string; description: string }[] = [
  { label: 'Araç çekici & yol yardımı', href: '/kategori/hizmetler/teknik-servis/yol-yardim-cekici', description: 'Acil araç çekici mi lazım?' },
  { label: 'Çiçekçi & hediye', href: '/kategori/sanat-hobi', description: 'Vip çiçekçilik bir tık uzağınızda!' },
  { label: 'Evden eve nakliyat', href: '/kategori/hizmetler/nakliyat/evden-eve-nakliyat', description: 'Taşınma için güvenilir nakliyeci ilanları.' },
]

/** İlanlardan dönüşümlü banner reklamları – eczane listesi altında kısa başlıklı site içi linkler. */
export const NOBETCI_BANNER_LINKS: { title: string; href: string; tag?: string }[] = [
  { title: 'Araç çekici & yol yardımı', href: '/kategori/hizmetler/teknik-servis/yol-yardim-cekici', tag: 'Hizmet' },
  { title: 'Evden eve nakliyat', href: '/kategori/hizmetler/nakliyat/evden-eve-nakliyat', tag: 'Hizmet' },
  { title: 'Çiçekçi & hediye', href: '/kategori/sanat-hobi', tag: 'İlan' },
  { title: 'Oto tamir & bakım', href: '/kategori/hizmetler/teknik-servis/oto-tamir-bakim', tag: 'Hizmet' },
  { title: 'Boya badana & tadilat', href: '/kategori/hizmetler/tadilat-dekorasyon/boya-badana', tag: 'Hizmet' },
  { title: 'Klima montaj & servis', href: '/kategori/hizmetler/isitma-sogutma-servis/klima-servisi', tag: 'Hizmet' },
  { title: 'Veteriner & pet shop', href: '/kategori/hayvanlar', tag: 'Kategori' },
  { title: 'Emlak & kiralık daire', href: '/kategori/emlak', tag: 'Kategori' },
  { title: 'Vasıta & araç ilanları', href: '/kategori/vasita', tag: 'Kategori' },
  { title: 'Elektrik & tesisat', href: '/kategori/hizmetler/elektrik-tesisat/elektrik-ariza', tag: 'Hizmet' },
  { title: 'Temizlik & ev hizmeti', href: '/kategori/hizmetler/temizlik/ev-temizligi', tag: 'Hizmet' },
  { title: 'Düğün & organizasyon', href: '/kategori/hizmetler/profesyonel-organizasyon/dugun-etkinlik', tag: 'Hizmet' },
]
