# Eski URL Yönlendirmeleri - 404 Hatalarını Önleme

Bu dokümantasyon, Google Search Console'daki 404 hatalarını önlemek için yapılan eski URL yönlendirmelerini açıklar.

## 📊 Sorun

Google Search Console'da tespit edilen eski URL formatları:

1. **www.alo17.tr** URL'leri - www yönlendirmesi gerekli
2. **/commodity/** path'leri - Eski sistem URL'leri
3. **/detail.php**, **/content.php** - Eski PHP dosyaları
4. **Sayısal ID'ler** - `/81277225285`, `/81277225285.html` gibi
5. **/shop/**, **/ctg/**, **/shopping/**, **/products/** - Eski path'ler
6. **Query string'li eski URL'ler** - `?id=81277225285`, `?s=81277225285` gibi

## ✅ Yapılan İyileştirmeler

### 1. www Yönlendirmesi İyileştirildi

**Önceki Kod:**
```typescript
if (hostname && (hostname.startsWith('www.') || hostname === 'www.alo17.tr')) {
  // ...
}
```

**Yeni Kod:**
```typescript
if (hostname && hostname.startsWith('www.')) {
  const url = request.nextUrl.clone();
  url.hostname = hostname.replace(/^www\./, '');
  url.protocol = 'https:'; // HTTPS'e zorla
  return NextResponse.redirect(url, 301);
}
```

**Değişiklikler:**
- Tüm `www.` ile başlayan hostname'ler yakalanıyor
- HTTPS'e zorlanıyor
- 301 Permanent Redirect kullanılıyor

### 2. Eski URL Pattern'leri Genişletildi

**Eklenen Pattern'ler:**

1. **Sayısal ID Pattern'leri:**
   - `/^\/[0-9]{10,15}$/` - 10-15 haneli sayılar (`/81277225285`)
   - `/^\/[0-9]{10,15}\.(html|htm|phtml|shtml)$/` - Uzantılı sayısal ID'ler
   - `/^\/[0-9]{10,15}\.html$/` - `.html` uzantılı
   - `/^\/[0-9]{10,15}\.htm$/` - `.htm` uzantılı
   - `/^\/[0-9]{10,15}\.phtml$/` - `.phtml` uzantılı
   - `/^\/[0-9]{10,15}\.shtml$/` - `.shtml` uzantılı

2. **Query String Pattern'leri:**
   - `/^\?[0-9]{10,15}$/` - `?81277225285`
   - `/^\?s=[0-9]{10,15}$/` - `?s=81277225285`
   - `/^\?commodity\//` - `?commodity/voice/concludes81193970314`

3. **Eski Sistem Path'leri:**
   - `/^\/shop\/goods_id=/` - `/shop/goods_id=81277225285`
   - `/^\/shop\/detial\//` - `/shop/detial/g81277225285.html`

### 3. Query String Kontrolü Eklendi

**Yeni Özellik:**
```typescript
const hasOldQueryParams = 
  searchParams.has('id') && /^[0-9]{10,15}$/.test(searchParams.get('id') || '') ||
  searchParams.has('s') && /^[0-9]{10,15}$/.test(searchParams.get('s') || '') ||
  searchParams.has('ctgItemCd') && /^[0-9]{10,15}$/.test(searchParams.get('ctgItemCd') || '') ||
  searchParams.has('q') && /^[0-9]{10,15}$/.test(searchParams.get('q') || '') ||
  searchParams.has('goods_id') && /^[0-9]{10,15}$/.test(searchParams.get('goods_id') || '');
```

**Yakalanan Query Parametreleri:**
- `?id=81277225285`
- `?s=81277225285`
- `?ctgItemCd=81277225285`
- `?q=81277225285`
- `?goods_id=81277225285`

## 📋 Yakalanan URL Örnekleri

### www Yönlendirmeleri
- ✅ `https://www.alo17.tr/commodity/archives/lawsuits813812685264` → `https://alo17.tr/`
- ✅ `https://www.alo17.tr/detail.php?81277225285` → `https://alo17.tr/`

### Eski Path'ler
- ✅ `/commodity/archives/lawsuits813812685264` → `/`
- ✅ `/detail.php?81277225285` → `/`
- ✅ `/content.php?id=81277225285` → `/`
- ✅ `/shop/detial/g81277225285.html` → `/`
- ✅ `/ctg/search/?ctgItemCd=81277225285` → `/`
- ✅ `/shopping/search-word/list?q=81277225285` → `/`
- ✅ `/products/81277225285` → `/`

### Sayısal ID'ler
- ✅ `/81277225285` → `/`
- ✅ `/81277225285.html` → `/`
- ✅ `/81277225285.htm` → `/`
- ✅ `/81277225285.phtml` → `/`
- ✅ `/81277225285.shtml` → `/`

### Query String'ler
- ✅ `/?81277225285` → `/`
- ✅ `/?s=81277225285` → `/`
- ✅ `/?commodity/voice/concludes81193970314` → `/`

## 🎯 Beklenen Sonuçlar

1. **404 Hataları Azalacak:**
   - Tüm eski URL'ler ana sayfaya yönlendirilecek
   - Google Search Console'daki 404 hataları azalacak

2. **SEO İyileştirmesi:**
   - 301 Permanent Redirect kullanıldığı için SEO değeri korunacak
   - www yönlendirmesi ile canonical URL'ler düzgün çalışacak

3. **Kullanıcı Deneyimi:**
   - Eski linkler çalışmaya devam edecek
   - Kullanıcılar ana sayfaya yönlendirilecek

## 🔍 Test Edilmesi Gerekenler

Aşağıdaki URL'lerin test edilmesi önerilir:

```bash
# www yönlendirmesi
curl -I https://www.alo17.tr/commodity/test
# Beklenen: 301 → https://alo17.tr/

# Eski path'ler
curl -I https://alo17.tr/detail.php?id=12345678901
# Beklenen: 301 → https://alo17.tr/

# Sayısal ID'ler
curl -I https://alo17.tr/12345678901
# Beklenen: 301 → https://alo17.tr/

# Query string'ler
curl -I "https://alo17.tr/?id=12345678901"
# Beklenen: 301 → https://alo17.tr/
```

## 📝 Notlar

1. **301 Permanent Redirect:**
   - SEO için en uygun redirect tipi
   - Google'a bu URL'lerin kalıcı olarak taşındığını söyler

2. **HTTPS Zorunluluğu:**
   - Tüm yönlendirmeler HTTPS'e zorlanıyor
   - Güvenlik için önemli

3. **Query String Temizleme:**
   - Eski query parametreleri temizleniyor
   - Temiz URL'ler SEO için daha iyi

## 🚀 Sonraki Adımlar

1. **Google Search Console'da Kontrol:**
   - 1-2 hafta sonra 404 hatalarının azalıp azalmadığını kontrol edin
   - "URL Inspection" tool'u ile test edin

2. **Monitoring:**
   - Server log'larında redirect'lerin çalışıp çalışmadığını kontrol edin
   - 404 hatalarını takip edin

3. **İyileştirmeler:**
   - Gerekirse yeni pattern'ler eklenebilir
   - Belirli URL'ler için özel yönlendirmeler yapılabilir

## 📚 İlgili Dosyalar

- `src/middleware.ts` - Ana redirect logic
- `src/app/robots.ts` - Robots.txt (eski URL'ler engellenmiş)
- `SEO_İYİLEŞTİRMELER.md` - Genel SEO iyileştirmeleri
