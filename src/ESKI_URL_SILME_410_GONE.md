# Eski URL'leri Silme - 410 Gone Kullanımı

Bu dokümantasyon, eski ve kullanılmayan URL'lerin 410 Gone status code ile kalıcı olarak silinmesini açıklar.

## 🎯 Neden 410 Gone?

### 301 Redirect vs 410 Gone

**301 Permanent Redirect:**
- ✅ Kullanıcılar ana sayfaya yönlendirilir
- ❌ Google bu URL'leri index'te tutmaya devam eder
- ❌ Crawl budget'ı boşa harcar
- ❌ Index'ten çıkması uzun sürer

**410 Gone (Kalıcı Olarak Silindi):**
- ✅ Google'a URL'in kalıcı olarak silindiğini açıkça söyler
- ✅ Index'ten çok daha hızlı çıkarır
- ✅ Crawl budget'ı korur (Google tekrar denemez)
- ✅ SEO için daha sağlıklı
- ✅ Kullanıcıya bilgilendirici sayfa gösterilebilir

## ✅ Yapılan Değişiklikler

### 1. Middleware Güncellemesi

**Önceki Yaklaşım (301 Redirect):**
```typescript
// Ana sayfaya yönlendir (301 Permanent Redirect)
return NextResponse.redirect(redirectUrl, 301);
```

**Yeni Yaklaşım (410 Gone):**
```typescript
// 410 Gone - Kalıcı olarak silindi (Google index'ten daha hızlı çıkarır)
return new NextResponse(html, {
  status: 410,
  statusText: 'Gone',
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  },
});
```

### 2. Kullanıcı Deneyimi

410 Gone response'unda kullanıcıya bilgilendirici bir HTML sayfası gösteriliyor:
- Açıklayıcı mesaj: "Sayfa Kaldırıldı"
- Ana sayfaya dön butonu
- İlanları görüntüle butonu
- İletişim linki

## 📋 Yakalanan URL Pattern'leri

Aşağıdaki URL pattern'leri 410 Gone döndürüyor:

### Eski Sistem Path'leri
- `/commodity/archives/lawsuits813812685264` → 410 Gone
- `/detail.php?id=81277225285` → 410 Gone
- `/content.php?id=81277225285` → 410 Gone
- `/shop/detial/g81277225285.html` → 410 Gone
- `/ctg/search/?ctgItemCd=81277225285` → 410 Gone
- `/shopping/search-word/list?q=81277225285` → 410 Gone
- `/products/81277225285` → 410 Gone

### Sayısal ID'ler
- `/81277225285` → 410 Gone
- `/81277225285.html` → 410 Gone
- `/81277225285.htm` → 410 Gone
- `/81277225285.phtml` → 410 Gone
- `/81277225285.shtml` → 410 Gone

### Query String'ler
- `/?81277225285` → 410 Gone
- `/?s=81277225285` → 410 Gone
- `?id=81277225285` → 410 Gone
- `?ctgItemCd=81277225285` → 410 Gone
- `?q=81277225285` → 410 Gone
- `?goods_id=81277225285` → 410 Gone

## 🎯 Beklenen Sonuçlar

### 1. Google Search Console
- ✅ 404 hataları azalacak (410 Gone olarak işaretlenecek)
- ✅ Index'ten çıkma süresi hızlanacak (1-2 hafta)
- ✅ Crawl budget korunacak

### 2. SEO İyileştirmesi
- ✅ Google eski URL'leri tekrar denemeyecek
- ✅ Index kalitesi artacak
- ✅ Sadece aktif sayfalar index'te kalacak

### 3. Kullanıcı Deneyimi
- ✅ Kullanıcılar bilgilendirici bir sayfa görecek
- ✅ Ana sayfaya veya ilanlara yönlendirilecek
- ✅ Profesyonel görünüm

## 🔍 Test

Aşağıdaki komutlarla test edebilirsiniz:

```bash
# Eski path testi
curl -I https://alo17.tr/commodity/test
# Beklenen: HTTP/1.1 410 Gone

# Sayısal ID testi
curl -I https://alo17.tr/12345678901
# Beklenen: HTTP/1.1 410 Gone

# Query string testi
curl -I "https://alo17.tr/?id=12345678901"
# Beklenen: HTTP/1.1 410 Gone

# HTML içeriği kontrolü
curl https://alo17.tr/12345678901
# Beklenen: HTML sayfası (410 Gone mesajı ile)
```

## 📊 Google Search Console'da Takip

### 1. Coverage Report
- "Excluded" sekmesinde 410 Gone sayfalarını görebilirsiniz
- "Removed" kategorisinde listelenir

### 2. URL Inspection
- Eski URL'leri test edin
- "Excluded by 'removed' status" mesajını görmelisiniz

### 3. Index Status
- 1-2 hafta içinde eski URL'ler index'ten çıkmalı
- Index sayısı azalmalı (bu normal ve istenen bir durum)

## ⚠️ Önemli Notlar

### 1. www Yönlendirmesi
- `www.alo17.tr` → `alo17.tr` yönlendirmesi **hala 301** kullanıyor
- Bu doğru, çünkü www versiyonu hala aktif (sadece canonical değil)

### 2. Cache Kontrolü
- 410 Gone response'ları 1 saat cache'leniyor
- CDN'lerde de cache'lenecek (s-maxage=3600)

### 3. Robots Meta
- 410 Gone sayfasında `noindex, nofollow` var
- Google bu sayfayı index'lemeyecek

## 🚀 Sonraki Adımlar

1. **Monitoring (1-2 Hafta):**
   - Google Search Console'da 410 Gone sayılarını takip edin
   - Index'ten çıkma süresini ölçün

2. **İyileştirmeler:**
   - Gerekirse yeni pattern'ler eklenebilir
   - Analytics'te 410 Gone trafiğini takip edin

3. **Raporlama:**
   - Haftalık 410 Gone sayılarını raporlayın
   - Index kalitesi iyileşmesini ölçün

## 📚 İlgili Dokümantasyon

- `ESKI_URL_YONLENDIRMELERI.md` - Önceki 301 redirect yaklaşımı (artık kullanılmıyor)
- `SEO_İYİLEŞTİRMELER.md` - Genel SEO iyileştirmeleri
- [Google: 410 Gone](https://developers.google.com/search/docs/crawling-indexing/http-status-codes#410)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/410)

## ✅ Avantajlar Özeti

| Özellik | 301 Redirect | 410 Gone |
|---------|-------------|----------|
| Google Index'ten Çıkma | Yavaş (aylar) | Hızlı (1-2 hafta) |
| Crawl Budget | Boşa harcar | Korur |
| Kullanıcı Deneyimi | ✅ Yönlendirme | ✅ Bilgilendirme |
| SEO Sağlığı | ⚠️ Orta | ✅ İyi |
| Index Kalitesi | ⚠️ Düşük | ✅ Yüksek |

**Sonuç:** 410 Gone, eski ve kullanılmayan URL'ler için daha sağlıklı bir yaklaşımdır.
