# Nöbetçi Eczane Modülü – Mimari Özet

## Veri katmanı

| Bileşen | Açıklama |
|--------|----------|
| **Prisma** | `NobetciEczaneRecord`: `id`, `name`, `address`, `phone`, `mapQuery`, `ilceSlug`, `validForDate` (YYYY-MM-DD), `createdAt`. İndeksler: `validForDate`, `(validForDate, ilceSlug)`. |
| **Lib** (`src/lib/nobetci-eczane.ts`) | Tip `NobetciEczane`, mock liste, `getNobetciEczaneler()`, `getNobetciEczanelerFromDb()` (dynamic import ile prisma), `getNobetciEczaneKaynakForCron()`, `getTodayTurkeyYYYYMMDD()`, `isValidIlceSlug()`, `getNobetciTarihMetin()`, `NOBETCI_SPONSORLU_LINKS`, `NOBETCI_BANNER_LINKS`. |

## Veri akışı

1. **Yazma (günde bir)**  
   Vercel Cron her gün **15:30 UTC** (18:30 TR) → `GET/POST /api/cron/nobetci-eczane`.  
   Yetki: `CRON_SECRET`, `Authorization: Bearer`, veya `x-vercel-cron`.  
   İşlem: `validForDate = bugün` kayıtları silinir → `getNobetciEczaneKaynakForCron()` sonucu DB’ye `createMany` ile yazılır.

2. **Okuma (her sayfa)**  
   `app/nobetci-eczane/page.tsx` ve `app/nobetci-eczane/[ilce]/page.tsx`:  
   `getNobetciEczanelerFromDb()` ile bugünün listesi alınır; boşsa `getNobetciEczaneler()` mock’u kullanılır.  
   Revalidate: 3600 saniye.

## Sayfa ve UI

| Rota | Bileşen | Açıklama |
|------|---------|----------|
| `/nobetci-eczane` | Server page | Tüm ilçeler; `NobetciEczaneModule` + sidebar “İlçelere Göre”. |
| `/nobetci-eczane/[ilce]` | Server page | `generateStaticParams` = tüm ilçe slug’ları; ilçe filtresi + aynı modül. |
| **NobetciEczaneModule** (client) | List + banner + sponsorlu | İlçe select, eczane kartları (adres, tel, harita), “Siteden öne çıkanlar” (6 rastgele banner), “Sponsorlu” linkler. |
| **NobetciEczaneWidget** | Sidebar/mobil | Tek link: `/nobetci-eczane`. |

## Cron ve sitemap

- **vercel.json**: `"path": "/api/cron/nobetci-eczane", "schedule": "30 15 * * *"`.
- **sitemap.ts**: `baseUrl/nobetci-eczane` ve her ilçe için `baseUrl/nobetci-eczane/{ilce.slug}`.

## Bağımlılıklar

- Lib: `canakkale-seo` (CANAKKALE_ILCELER), `prisma` (sadece `getNobetciEczanelerFromDb` içinde dynamic import).
- Client modül sadece tip + sabitler kullandığı için Prisma client bundle’a dahil olmaz.

## Genişletme

- **Gerçek veri kaynağı**: `getNobetciEczaneKaynakForCron()` içinde mock yerine Eczacı Odası API veya scraper entegre edilebilir.
- **Banner/liste**: `NOBETCI_BANNER_LINKS` ve `NOBETCI_SPONSORLU_LINKS` aynı lib dosyasında güncellenebilir.
