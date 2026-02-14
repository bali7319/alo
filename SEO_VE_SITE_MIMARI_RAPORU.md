# SEO Ayarları ve Site Mimarisi – Kontrol Raporu

**Tarih:** Şubat 2026  
**Site:** alo17.tr

---

## 1. SEO Ayarları Özeti

### 1.1 Genel metadata (root layout)
- **metadataBase:** `https://alo17.tr` ✓
- **Title:** Varsayılan + template `%s | Alo17` ✓
- **Description, keywords, Open Graph, Twitter card** tanımlı ✓
- **Robots:** index/follow + googleBot ayarları ✓
- **Verification:** Facebook domain var; Google Search Console kodu yorum satırında (gerekirse `layout.tsx` içinde `verification.google` eklenebilir)

### 1.2 robots.txt (`/src/app/robots.ts`)
- **Allow:** `/` (tüm site)
- **Disallow:** `/api/`, `/dev/`
- **Sitemap:** `https://alo17.tr/sitemap.xml` ✓
- Kullanıcıya özel sayfalar robots ile kapatılmıyor; `noindex` ile işaretleniyor (GSC uyarılarını azaltmak için doğru tercih)

### 1.3 Sitemap (`/src/app/sitemap.ts`)
- **Statik sayfalar:** Ana sayfa, /kategoriler, /ilanlar, /hakkimizda, /iletisim, /sss, /ilan-ver, /yardim, /premium, yasal sayfalar, /kariyer, /sozlesmeler, /kampanyalar, /social, /yeni-urunler (priority ve changeFrequency atanmış)
- **Kategori sayfaları:** `/kategori/[slug]`, alt ve alt-alt kategoriler dahil
- **Sözleşme sayfaları:** `/sozlesmeler/[id]`
- **İlanlar:** Aktif + onaylı + süresi dolmamış ilanlar (en fazla 10.000 URL)
- **Limit:** 50.000 URL üst sınırı kontrol ediliyor ✓

### 1.4 Canonical URL’ler
| Sayfa / Yapı | Canonical |
|--------------|-----------|
| Ana sayfa | `https://alo17.tr/` ✓ |
| /ilanlar | `https://alo17.tr/ilanlar` ✓ |
| /kategoriler | `https://alo17.tr/kategoriler` ✓ |
| /ilan-ver | `https://alo17.tr/ilan-ver` ✓ |
| /ilan/[slug-id] | `https://alo17.tr/ilan/{canonicalSlug}` (slug + id) ✓ |
| /kategori/[slug] | `https://alo17.tr/kategori/{slug}` ✓ |
| /kategori/[slug]/[subSlug] | Tam path ✓ |
| /kategori/.../[subsubslug] | Tam path ✓ |
| Sözleşmeler, KVKK, gizlilik, çerez, kullanım koşulları, yardım, kariyer, kampanyalar, social, yeni-urunler | İlgili path ✓ |

### 1.5 İlan detay SEO
- **generateMetadata:** Başlık, açıklama, fiyat, kategori, konum, keywords
- **Canonical:** Slug + ID ile tek URL; farklı slug/id varyantları 301 ile canonical’e yönlendiriliyor
- **Open Graph / Twitter:** Başlık, açıklama, ilk ilan görseli
- **JSON-LD:** Ürün/ilan yapısal verisi (SeoJsonLd)
- **revalidate:** 300 (5 dk ISR)

### 1.6 Noindex sayfalar (middleware + layout)
- **Middleware (X-Robots-Tag: noindex, nofollow):**  
  `/giris`, `/kayit`, `/sifre-sifirla`, `/sifremi-unuttum`, `/unsubscribe`,  
  `/admin`, `/moderator`, `/profil`, `/ilanlarim`, `/favorilerim`, `/mesajlar`, `/odeme`, `/fatura`, `/notifications`, `/ilan-ver/duzenle`, `/ilan-ver/onizle`

### 1.7 Admin SEO ayarları (Sistem Ayarları)
- **İç linkleme (internal linking):** Açık/kapalı – ilan açıklamasında kategori/ilan linkleme
- **Link takibi (link tracking):** Açık/kapalı – tıklama takibi
- API: `/api/admin/seo-settings` (GET/PUT), veri `lib/seo-settings` ile saklanıyor

### 1.8 Yardımcı yapılar
- **lib/metadata.ts:** `createMetadata`, `getCanonicalUrl`, `withCanonical` – noindex/nofollow, OG, Twitter, canonical
- **lib/seo-settings.ts:** Admin’den yönetilen SEO ayarları (internalLinking, linkTracking)

---

## 2. Site Mimarisi (URL yapısı)

### 2.1 Hiyerarşi
```
/                           → Ana sayfa
/ilanlar                    → Tüm ilanlar listesi
/ilan/[slug-id]             → İlan detay (canonical slug + id)
/kategoriler                → Kategori listesi
/kategori/[slug]            → Ana kategori
/kategori/[slug]/[subSlug]  → Alt kategori
/kategori/.../[subsubslug]  → Alt-alt kategori
/ilan-ver                   → Yeni ilan (giriş sonrası akış)
/ilan-ver/duzenle/[id]      → İlan düzenleme (noindex)
/ilan-ver/onizle/[id]       → Önizleme (noindex)

/hakkimizda, /iletisim, /sss, /yardim
/ilan-verme-kurallari, /premium
/gizlilik, /kvkk, /cerez-politikasi, /kullanim-kosullari
/kariyer, /kampanyalar, /sozlesmeler, /sozlesmeler/ev-kiralama, /sozlesmeler/[id]
/yeni-urunler, /social

/giris, /kayit, /sifremi-unuttum, /sifre-sifirla  → noindex
/profil, /ilanlarim, /favorilerim, /mesajlar      → noindex
/odeme, /fatura, /notifications                   → noindex
/admin/*, /moderator/*                             → noindex
/unsubscribe                                       → noindex
```

### 2.2 Yönlendirmeler
- **www → non-www:** `www.alo17.tr` → `https://alo17.tr` (301)
- **İlan URL birleştirme:** Aynı ilan için farklı slug/id → tek canonical URL’e 301 (permanentRedirect)

### 2.3 Eksik / İyileştirme notları
1. **Google Search Console:** Doğrulama kodu kullanılacaksa `src/app/layout.tsx` içinde `verification.google` değeri doldurulmalı.
2. **OG görseli:** Varsayılan `/images/placeholder.jpg` – marka için özel 1200x630 görsel eklenebilir.
3. **/ilan-ver:** Layout’ta canonical ve metadata var ✓; ek sayfa bazlı meta ihtiyacı yoksa mevcut yapı yeterli.
4. **Footer Yasal:** "Gizlilik" linki eklendi (`/gizlilik`) – sayfa vardı, footer’da eksikti.

---

## 3. Sonuç

- **SEO ayarları:** metadata, canonical, robots, sitemap, noindex sayfalar ve ilan detay SEO’su tutarlı ve amaca uygun.
- **Site mimarisi:** URL hiyerarşisi net; kategori ve ilan sayfaları canonical ve sitemap ile destekleniyor; www yönlendirmesi ve ilan URL birleştirme doğru çalışıyor.
- **Küçük iyileştirme:** `/unsubscribe` middleware noindex listesine eklendi (X-Robots-Tag ile diğer özel sayfalarla uyum).

Bu rapor proje kökünde `SEO_VE_SITE_MIMARI_RAPORU.md` olarak kaydedildi; ileride ayar veya sayfa eklerken referans alınabilir.
