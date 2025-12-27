# Performans İyileştirme - Tek Komut (Dosya Olmadan)

## 🚀 Hızlı Çözüm

Sunucuda şu komutu çalıştırın (dosya gerekmez):

```bash
cd /var/www/alo17 && sudo -u postgres psql -d alo17_db << 'EOF'
CREATE INDEX IF NOT EXISTS idx_listing_category ON "Listing"(category);
CREATE INDEX IF NOT EXISTS idx_listing_subcategory ON "Listing"(subCategory);
CREATE INDEX IF NOT EXISTS idx_listing_active ON "Listing"(isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium ON "Listing"(isPremium, isActive);
CREATE INDEX IF NOT EXISTS idx_listing_created ON "Listing"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_listing_user ON "Listing"(userId);
CREATE INDEX IF NOT EXISTS idx_listing_category_active ON "Listing"(category, isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium_active ON "Listing"(isPremium, isActive, approvalStatus, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_listing_category_subcategory ON "Listing"(category, subCategory, isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
EOF
npm run build && pm2 restart alo17 && pm2 status
```

## 📋 Adım Adım (Alternatif)

Eğer yukarıdaki komut çalışmazsa:

### 1. Database Index'leri

```bash
sudo -u postgres psql -d alo17_db
```

PostgreSQL shell'de:

```sql
CREATE INDEX IF NOT EXISTS idx_listing_category ON "Listing"(category);
CREATE INDEX IF NOT EXISTS idx_listing_subcategory ON "Listing"(subCategory);
CREATE INDEX IF NOT EXISTS idx_listing_active ON "Listing"(isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium ON "Listing"(isPremium, isActive);
CREATE INDEX IF NOT EXISTS idx_listing_created ON "Listing"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_listing_user ON "Listing"(userId);
CREATE INDEX IF NOT EXISTS idx_listing_category_active ON "Listing"(category, isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium_active ON "Listing"(isPremium, isActive, approvalStatus, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_listing_category_subcategory ON "Listing"(category, subCategory, isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
\q
```

### 2. Build ve Restart

```bash
cd /var/www/alo17
npm run build
pm2 restart alo17
pm2 status
```

## ✅ Kontrol

Index'lerin oluşturulduğunu kontrol edin:

```bash
sudo -u postgres psql -d alo17_db -c "\d+ Listing" | grep index
```

## 🎯 Beklenen Sonuç

- ✅ 10 index oluşturuldu
- ✅ Build başarılı
- ✅ PM2 restart edildi
- ✅ Site daha hızlı çalışıyor

