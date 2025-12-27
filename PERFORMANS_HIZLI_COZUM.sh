#!/bin/bash
# Performans İyileştirme - Hızlı Çözüm (Dosya olmadan)

echo "🚀 Performans İyileştirme Başlatılıyor..."

cd /var/www/alo17

# 1. Database index'lerini oluştur (dosya olmadan)
echo "📊 Database index'leri oluşturuluyor..."
sudo -u postgres psql -d alo17_db << 'EOF'
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
EOF

echo "✅ Database index'leri oluşturuldu!"

# 2. Build yap
echo "🏗️  Build yapılıyor..."
npm run build

# 3. PM2'yi yeniden başlat
echo "🔄 PM2 yeniden başlatılıyor..."
pm2 restart alo17

# 4. Durumu göster
echo ""
echo "📊 PM2 Durumu:"
pm2 status

echo ""
echo "✅ Performans iyileştirme tamamlandı!"

