# SEO İyileştirme - İlan Başlığı Otomatik Kullanımı

## ✅ Yapılan İyileştirmeler

### 1. Title (Sayfa Başlığı)
- ✅ İlan başlığı otomatik kullanılıyor
- ✅ Fiyat eklendi
- ✅ Kategori eklendi
- ✅ Format: `{İlan Başlığı} - {Fiyat} | {Kategori} | Alo17 Çanakkale`

**Örnek:**
```
iPhone 14 Pro Max - ₺25.000 | Elektronik | Alo17 Çanakkale
```

### 2. Description (Meta Açıklama)
- ✅ İlan açıklaması kullanılıyor (ilk 150 karakter)
- ✅ İlan başlığı fallback olarak kullanılıyor
- ✅ Konum ve fiyat bilgisi eklendi
- ✅ Format: `{Açıklama}... {Konum}, Çanakkale. Fiyat: {Fiyat}. Alo17'de güvenli alışveriş.`

**Örnek:**
```
iPhone 14 Pro Max 256GB, az kullanılmış, kutulu, garantili. Çanakkale, Çanakkale. Fiyat: ₺25.000. Alo17'de güvenli alışveriş.
```

### 3. Keywords (Anahtar Kelimeler)
- ✅ İlan başlığı
- ✅ İlan başlığı + çanakkale
- ✅ Kategori
- ✅ Alt kategori (varsa)
- ✅ Kategori + çanakkale
- ✅ Konum
- ✅ Satılık + kategori

**Örnek:**
```
['iphone 14 pro max', 'iphone 14 pro max çanakkale', 'elektronik', 'telefon', 'elektronik çanakkale', 'çanakkale', 'ikinci el', 'satılık', 'satılık elektronik', 'alo17', 'alo17 çanakkale']
```

### 4. Open Graph & Twitter Cards
- ✅ İlan başlığı kullanılıyor
- ✅ İlan açıklaması kullanılıyor
- ✅ İlan görseli kullanılıyor
- ✅ SEO-friendly URL kullanılıyor

### 5. Canonical URL
- ✅ SEO-friendly slug formatı: `{ilan-basligi-slug}-{id}`
- ✅ Örnek: `https://alo17.tr/ilan/iphone-14-pro-max-cmjl5p5jg0001bf5qzof4pd56`

## 📊 SEO Faydaları

1. **Arama Motoru Optimizasyonu**
   - İlan başlığı doğrudan title'da kullanılıyor
   - Description'da ilan detayları var
   - Keywords'de ilan başlığı ve kategori var

2. **Sosyal Medya Paylaşımları**
   - Open Graph ve Twitter Cards optimize edildi
   - İlan görseli otomatik kullanılıyor
   - Başlık ve açıklama otomatik dolduruluyor

3. **URL Yapısı**
   - SEO-friendly slug formatı
   - İlan başlığı URL'de görünüyor
   - ID hala mevcut (geriye dönük uyumluluk)

## 🔍 Test Etme

1. **Tarayıcıda Test:**
   ```
   https://alo17.tr/ilan/cmjl5p5jg0001bf5qzof4pd56
   ```
   - Sayfa başlığını kontrol edin (tarayıcı sekmesi)
   - View Source yapıp `<title>` ve `<meta name="description">` tag'lerini kontrol edin

2. **Google Search Console:**
   - URL'yi Google'a gönderin
   - Rich Results Test ile kontrol edin

3. **Sosyal Medya Test:**
   - Facebook Debugger: https://developers.facebook.com/tools/debug/
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

## ⚠️ Önemli Notlar

1. **URL Formatı:**
   - Eski ID formatı hala çalışıyor (geriye dönük uyumluluk)
   - Yeni slug formatı: `{slug}-{id}`
   - Her iki format da destekleniyor

2. **Description Uzunluğu:**
   - İlk 150 karakter kullanılıyor
   - Google genellikle 155-160 karakter gösterir
   - Fazla uzun description'lar kesilir

3. **Title Uzunluğu:**
   - Google genellikle 50-60 karakter gösterir
   - Uzun başlıklar kesilebilir
   - Önemli bilgiler başta olmalı

## 🚀 Sunucuda Uygulama

```bash
cd /var/www/alo17
npm run build
pm2 restart alo17
```

## ✅ Başarı Kriterleri

- ✅ Her ilan sayfasında ilan başlığı title'da görünüyor
- ✅ Description'da ilan açıklaması var
- ✅ Keywords'de ilan başlığı ve kategori var
- ✅ Open Graph ve Twitter Cards çalışıyor
- ✅ URL SEO-friendly formatında































