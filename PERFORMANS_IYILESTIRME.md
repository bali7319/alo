# Performans İyileştirme - Site Çok Yavaş Sorunu

## 🔍 Tespit Edilen Sorunlar

1. **API route'larda limit yok** - Tüm ilanlar çekiliyor (binlerce kayıt)
2. **Pagination yok** - Category route'da tüm ilanlar tek seferde dönüyor
3. **Caching yok** - Her istekte database'e gidiyor
4. **Gereksiz field'lar** - Tüm field'lar çekiliyor (description çok büyük)
5. **Database index'leri eksik** - Sorgular yavaş çalışıyor

## ✅ Yapılan İyileştirmeler

### 1. Category API Route Optimizasyonu

**Dosya**: `src/app/api/listings/category/[slug]/route.ts`

- ✅ Pagination eklendi (varsayılan: 20 ilan)
- ✅ Limit eklendi
- ✅ Select ile sadece gerekli field'lar çekiliyor
- ✅ Description kısaltıldı (200 karakter)
- ✅ Response caching eklendi (60 saniye)
- ✅ Total count eklendi (pagination için)

### 2. Database Index'leri (Sunucuda Çalıştırın)

PostgreSQL'de index'ler oluşturun:

```sql
-- PostgreSQL'e bağlan
sudo -u postgres psql -d alo17_db

-- Index'leri oluştur
CREATE INDEX IF NOT EXISTS idx_listing_category ON "Listing"(category);
CREATE INDEX IF NOT EXISTS idx_listing_subcategory ON "Listing"(subCategory);
CREATE INDEX IF NOT EXISTS idx_listing_active ON "Listing"(isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium ON "Listing"(isPremium, isActive);
CREATE INDEX IF NOT EXISTS idx_listing_created ON "Listing"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_listing_user ON "Listing"(userId);

-- Composite index'ler (daha hızlı sorgular için)
CREATE INDEX IF NOT EXISTS idx_listing_category_active ON "Listing"(category, isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium_active ON "Listing"(isPremium, isActive, approvalStatus, createdAt DESC);

-- Çıkış
\q
```

### 3. Nginx Caching (Sunucuda)

`nginx-site-config.conf` dosyasını güncelleyin:

```nginx
# API route'lar için cache
location /api/listings/category {
    proxy_pass http://127.0.0.1:3000;
    proxy_cache_valid 200 60s;
    proxy_cache_bypass $http_pragma $http_authorization;
    add_header X-Cache-Status $upstream_cache_status;
    add_header Cache-Control "public, max-age=60";
}
```

## 🚀 Sunucuda Uygulama

### 1. Database Index'leri Oluştur

```bash
sudo -u postgres psql -d alo17_db << EOF
CREATE INDEX IF NOT EXISTS idx_listing_category ON "Listing"(category);
CREATE INDEX IF NOT EXISTS idx_listing_subcategory ON "Listing"(subCategory);
CREATE INDEX IF NOT EXISTS idx_listing_active ON "Listing"(isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium ON "Listing"(isPremium, isActive);
CREATE INDEX IF NOT EXISTS idx_listing_created ON "Listing"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_listing_user ON "Listing"(userId);
CREATE INDEX IF NOT EXISTS idx_listing_category_active ON "Listing"(category, isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium_active ON "Listing"(isPremium, isActive, approvalStatus, createdAt DESC);
EOF
```

### 2. Kodu Güncelle ve Build Et

```bash
cd /var/www/alo17

# Değişiklikleri çek veya dosyaları yükle
# ...

# Build yap
npm run build

# PM2'yi yeniden başlat
pm2 restart alo17
```

### 3. Nginx Cache Ayarları (Opsiyonel)

```bash
# Nginx yapılandırmasını güncelle
sudo nano /etc/nginx/sites-available/alo17.tr

# API cache ayarlarını ekle (yukarıdaki örnek)
# Sonra:
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Performans Testi

```bash
# API response time testi
time curl -s http://localhost:3000/api/listings/category/elektronik | head -c 100

# Database query time testi
sudo -u postgres psql -d alo17_db -c "EXPLAIN ANALYZE SELECT * FROM \"Listing\" WHERE category = 'Elektronik' AND \"isActive\" = true LIMIT 20;"
```

## ✅ Beklenen İyileştirmeler

- ✅ API response time: **%70-80 daha hızlı** (pagination sayesinde)
- ✅ Database query time: **%50-60 daha hızlı** (index'ler sayesinde)
- ✅ Memory kullanımı: **%60-70 azalma** (limit sayesinde)
- ✅ Network trafiği: **%80-90 azalma** (pagination ve description kısaltma)

## 🔧 Ek Optimizasyonlar (İsteğe Bağlı)

### 1. Redis Cache (İleri Seviye)

API response'ları Redis'te cache'leyebilirsiniz.

### 2. CDN Kullanımı

Static dosyalar için CDN kullanın.

### 3. Image Optimization

Next.js Image component'i zaten optimize ediyor, ama ek olarak:
- Image'leri CDN'de host edin
- WebP formatına çevirin
- Lazy loading kullanın

### 4. Database Connection Pooling

`.env` dosyasında:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

## 📈 Monitoring

Performansı izlemek için:

```bash
# PM2 monitör
pm2 monit

# Database slow query log
sudo -u postgres psql -d alo17_db -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

## ⚠️ Önemli Notlar

1. **Pagination zorunlu**: Artık API'ler pagination kullanıyor, frontend'i güncelleyin
2. **Cache süresi**: 60 saniye cache var, güncellemeler 1 dakika gecikebilir
3. **Description kısaltma**: Liste görünümünde description 200 karakterle sınırlı

