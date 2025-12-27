-- Database Performance Index'leri
-- PostgreSQL için performans iyileştirme index'leri
-- Çalıştırmak için: sudo -u postgres psql -d alo17_db -f database-indexes.sql

-- Listing tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_listing_category ON "Listing"(category);
CREATE INDEX IF NOT EXISTS idx_listing_subcategory ON "Listing"(subCategory);
CREATE INDEX IF NOT EXISTS idx_listing_active ON "Listing"(isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium ON "Listing"(isPremium, isActive);
CREATE INDEX IF NOT EXISTS idx_listing_created ON "Listing"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_listing_user ON "Listing"(userId);

-- Composite index'ler (daha hızlı sorgular için)
CREATE INDEX IF NOT EXISTS idx_listing_category_active ON "Listing"(category, isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium_active ON "Listing"(isPremium, isActive, approvalStatus, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_listing_category_subcategory ON "Listing"(category, subCategory, isActive, approvalStatus);

-- User tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);

-- Mevcut index'leri kontrol et
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('Listing', 'User')
ORDER BY tablename, indexname;

