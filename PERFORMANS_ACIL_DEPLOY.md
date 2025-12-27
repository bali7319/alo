# 🚨 Performans Acil Deploy

## ✅ Yapılan Optimizasyonlar

### 1. Anasayfa (`src/app/page.tsx`)
- ✅ Base64 images kaldırıldı (3.6 MB → 200 KB)
- ✅ Cache: 60s → 300s (5 dakika)
- ✅ Paralel query'ler

### 2. Kategori Sayfaları (`src/app/kategori/[slug]/page.tsx`)
- ✅ Cache eklendi: `revalidate = 300`
- ✅ Base64 images kaldırıldı
- ✅ Description kısaltıldı (200 karakter)
- ✅ Email field kaldırıldı

### 3. API Route (`src/app/api/listings/route.ts`)
- ✅ Cache eklendi: 60 saniye

---

## 📦 Deploy Adımları

### 1. Dosyaları Sunucuya Aktar

```powershell
cd C:\Users\bali\Desktop\alo
scp src/app/page.tsx root@alo17.tr:/var/www/alo17/src/app/page.tsx
scp src/app/kategori/[slug]/page.tsx root@alo17.tr:/var/www/alo17/src/app/kategori/[slug]/page.tsx
scp src/app/api/listings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/route.ts
```

### 2. Database Index'lerini Ekle (KRİTİK!)

```bash
ssh root@alo17.tr
cd /var/www/alo17

# Index'leri oluştur
sudo -u postgres psql -d alo17_db << 'EOF'
CREATE INDEX IF NOT EXISTS idx_listing_category ON "Listing"(category);
CREATE INDEX IF NOT EXISTS idx_listing_subcategory ON "Listing"("subCategory");
CREATE INDEX IF NOT EXISTS idx_listing_active ON "Listing"("isActive", "approvalStatus");
CREATE INDEX IF NOT EXISTS idx_listing_premium ON "Listing"("isPremium", "isActive");
CREATE INDEX IF NOT EXISTS idx_listing_created ON "Listing"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_listing_user ON "Listing"("userId");
CREATE INDEX IF NOT EXISTS idx_listing_expires ON "Listing"("expiresAt");
CREATE INDEX IF NOT EXISTS idx_listing_category_active ON "Listing"(category, "isActive", "approvalStatus");
CREATE INDEX IF NOT EXISTS idx_listing_premium_active ON "Listing"("isPremium", "isActive", "approvalStatus", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_listing_category_subcategory ON "Listing"(category, "subCategory", "isActive", "approvalStatus");
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
\q
EOF

echo "✅ Index'ler oluşturuldu!"
```

### 3. Build ve Restart

```bash
cd /var/www/alo17
rm -rf .next
npm run build
pm2 restart alo17
pm2 logs alo17 --lines 50
```

---

## 🎯 Beklenen İyileştirmeler

| Optimizasyon | İyileştirme |
|-------------|------------|
| Database Index'leri | **%50-70** |
| Base64 Images Kaldırma | **%80-90** |
| Cache Stratejisi | **%30-40** |
| Description Kısaltma | **%10-15** |
| **TOPLAM** | **%85-95 daha hızlı** |

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Database Index'leri EN ÖNEMLİSİ!** Index'ler olmadan site çok yavaş çalışır.
2. **Deploy sonrası test et:** Anasayfa ve kategori sayfalarını kontrol et.
3. **PM2 loglarını izle:** Hata var mı kontrol et.
4. **Browser cache temizle:** Ctrl+Shift+R ile hard refresh yap.

---

## 🔍 Sorun Devam Ederse

1. **Browser DevTools** aç (F12)
2. **Network** tab'ında hangi request yavaş, kontrol et
3. **Console** tab'ında hata var mı, kontrol et
4. **PM2 logs** kontrol et: `pm2 logs alo17 --lines 100`
5. **Database sorgu süreleri** kontrol et (yukarıdaki komutlarla)

