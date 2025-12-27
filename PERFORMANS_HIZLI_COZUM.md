# 🚀 Performans Hızlı Çözüm - Site Çok Yavaş

## 🔴 KRİTİK: Database Index'leri Ekle

**En önemli adım!** Database index'leri olmadan sorgular çok yavaş çalışır.

### Sunucuda Çalıştır:

```bash
ssh root@alo17.tr
cd /var/www/alo17

# Database index'lerini oluştur
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

**Beklenen İyileştirme: %50-70 daha hızlı sorgular**

---

## ✅ Yapılan Kod İyileştirmeleri

### 1. Anasayfa Cache Süresi Artırıldı
- `revalidate: 60` → `revalidate: 300` (5 dakika)
- Daha az database sorgusu

### 2. Paralel Query'ler
- Premium ve latest listings paralel çekiliyor
- `Promise.all` kullanılıyor

### 3. API Route Cache
- `/api/listings` route'unda 60 saniye cache eklendi
- `Cache-Control: public, s-maxage=60`

---

## 📦 Deploy Adımları

### 1. Dosyaları Sunucuya Aktar

```powershell
cd C:\Users\bali\Desktop\alo
scp src/app/page.tsx root@alo17.tr:/var/www/alo17/src/app/page.tsx
scp src/app/api/listings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/route.ts
```

### 2. Sunucuda Index'leri Oluştur ve Build Et

```bash
ssh root@alo17.tr
cd /var/www/alo17

# 1. Database index'lerini oluştur (YUKARIDAKI KOMUTLAR)

# 2. Build
rm -rf .next
npm run build

# 3. Restart
pm2 restart alo17
```

---

## 📊 Beklenen Performans İyileştirmeleri

| Optimizasyon | İyileştirme |
|-------------|------------|
| Database Index'leri | **%50-70** |
| Cache (5 dakika) | **%30-40** |
| Paralel Query'ler | **%10-15** |
| **TOPLAM** | **%70-85 daha hızlı** |

---

## 🔍 Performans Kontrolü

### Database Sorgu Sürelerini Kontrol Et:

```sql
-- PostgreSQL'de EXPLAIN ANALYZE ile sorgu sürelerini gör
EXPLAIN ANALYZE 
SELECT * FROM "Listing" 
WHERE "isActive" = true 
  AND "approvalStatus" = 'approved' 
  AND "expiresAt" > NOW()
ORDER BY "createdAt" DESC
LIMIT 20;
```

### PM2 Loglarını İzle:

```bash
pm2 logs alo17 --lines 100
```

---

## ⚠️ Ek İyileştirmeler (İsteğe Bağlı)

1. **Redis Cache** - İleri seviye cache için
2. **CDN** - Statik dosyalar için
3. **Image Optimization** - Base64 yerine CDN
4. **Database Connection Pooling** - Prisma zaten yapıyor

---

## 🎯 Öncelik Sırası

1. ✅ **Database Index'leri** (KRİTİK - Hemen yap!)
2. ✅ **Cache Süreleri** (Kod güncellemesi)
3. ⚠️ **Redis Cache** (İleri seviye - sonra)
4. ⚠️ **CDN** (İleri seviye - sonra)

