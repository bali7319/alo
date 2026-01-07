# Google Search Console SEO Düzeltmeleri

## Yapılan Değişiklikler

### 1. ✅ Eski URL Yönlendirmeleri
**Dosya:** `src/middleware.ts` ve `next.config.js`

Eski sistem URL'leri artık 301 (Permanent Redirect) ile yönlendiriliyor:
- `/commodity/*` → `/` (Ana sayfa)
- `/content.php*` → `/` (Ana sayfa)
- `/detail.php*` → `/` (Ana sayfa)
- `/shop/*` → `/ilanlar` (İlanlar sayfası)
- `/ctg/*` → `/kategoriler` (Kategoriler sayfası)
- `/shopping/*` → `/ilanlar`
- `/products/*` → `/ilanlar`
- `/p/*` → `/`
- Sayısal URL'ler (`/81118738`, `/814715701988.html`) → `/`
- Özel karakterler (`/$`, `/&`) → `/`

### 2. ✅ www.alo17.tr → alo17.tr Yönlendirmesi
**Dosya:** `src/middleware.ts`

`www.alo17.tr` adresinden gelen tüm istekler otomatik olarak `alo17.tr`'ye yönlendiriliyor (301 redirect).

### 3. ✅ robots.txt Güncellemesi
**Dosya:** `src/app/robots.ts`

Eski URL pattern'leri robots.txt'de engellendi:
- `/commodity/`
- `/content.php`
- `/detail.php`
- `/shop/`
- `/ctg/`
- `/shopping/`
- `/products/`
- `/p/`
- Sayısal URL'ler (`/*[0-9]*.html`, vb.)

### 4. ✅ 404 Sayfası - noindex
**Dosya:** `src/app/not-found.tsx`

404 sayfasına `noindex` metadata eklendi. Google artık 404 sayfalarını indexlemeyecek.

### 5. ✅ next.config.js Redirect Kuralları
**Dosya:** `next.config.js`

Next.js seviyesinde redirect kuralları eklendi (middleware ile birlikte çalışıyor).

## Beklenen Sonuçlar

1. **404 Hataları Azalacak:**
   - Eski URL'ler artık 301 redirect ile yönlendiriliyor
   - Google bu URL'leri index'ten kaldıracak

2. **5xx Hataları Azalacak:**
   - Eski URL'ler artık 404 yerine 301 döndürüyor
   - Sunucu hatası yerine yönlendirme yapılıyor

3. **Kopya Sayfalar Azalacak:**
   - www.alo17.tr → alo17.tr yönlendirmesi ile tek domain kullanılıyor
   - Canonical tag'ler doğru çalışacak

4. **Robots.txt Engellemeleri:**
   - Eski URL'ler artık robots.txt'de engellendi
   - Google bu URL'leri taramayacak

## Deploy Adımları

1. **Dosyaları sunucuya yükleyin:**
   ```powershell
   cd C:\Users\bali\Desktop\alo
   scp src/middleware.ts root@alo17.tr:/var/www/alo17/src/middleware.ts
   scp src/app/robots.ts root@alo17.tr:/var/www/alo17/src/app/robots.ts
   scp src/app/not-found.tsx root@alo17.tr:/var/www/alo17/src/app/not-found.tsx
   scp next.config.js root@alo17.tr:/var/www/alo17/next.config.js
   ```

2. **Build ve restart:**
   ```powershell
   ssh root@alo17.tr "cd /var/www/alo17 && npm run build && pm2 restart alo17 --update-env"
   ```

3. **Test edin:**
   - Eski URL'lerin yönlendirildiğini kontrol edin
   - www.alo17.tr'nin alo17.tr'ye yönlendirildiğini kontrol edin
   - robots.txt'nin güncellendiğini kontrol edin

## Google Search Console'da Yapılacaklar

1. **URL Kaldırma Talebi:**
   - Google Search Console → Kaldırma → Geçici kaldırma
   - Eski URL'leri toplu olarak kaldırma talebinde bulunun

2. **Sitemap Yeniden Gönderimi:**
   - Google Search Console → Sitemap'ler
   - Sitemap'i yeniden gönderin

3. **URL İnceleme:**
   - Birkaç eski URL'yi "URL'yi test et" ile kontrol edin
   - 301 redirect'in çalıştığını doğrulayın

## Notlar

- Değişikliklerin Google'da görünmesi birkaç hafta sürebilir
- Eski URL'ler zamanla index'ten kaldırılacak
- 301 redirect'ler sayesinde SEO değeri korunacak

