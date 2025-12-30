-- Performance Indexes for Category Listings API
-- Bu dosyayı sunucuda çalıştırmak için:
-- sudo -u postgres psql -d alo17_db -f add-indexes-direct.sql

-- Category ve subCategory index'leri (kategori filtreleme için)
CREATE INDEX IF NOT EXISTS idx_listing_category ON "Listing"(category);
CREATE INDEX IF NOT EXISTS idx_listing_subcategory ON "Listing"(subCategory);

-- Aktif ve onaylı ilanlar için composite index
CREATE INDEX IF NOT EXISTS idx_listing_active_approved ON "Listing"(isActive, approvalStatus) 
WHERE "isActive" = true AND "approvalStatus" = 'approved';

-- Süresi dolmamış ilanlar için index (expiresAt)
CREATE INDEX IF NOT EXISTS idx_listing_expires_at ON "Listing"(expiresAt) 
WHERE "expiresAt" > NOW();

-- Premium ve aktif ilanlar için composite index (sıralama için)
CREATE INDEX IF NOT EXISTS idx_listing_premium_active ON "Listing"(isPremium DESC, createdAt DESC) 
WHERE "isActive" = true AND "approvalStatus" = 'approved';

-- User ID index (admin filtreleme için)
CREATE INDEX IF NOT EXISTS idx_listing_user_id ON "Listing"("userId");

-- Category + Active + Approved composite index (en çok kullanılan sorgu)
CREATE INDEX IF NOT EXISTS idx_listing_category_active_approved ON "Listing"(category, isActive, approvalStatus, expiresAt) 
WHERE "isActive" = true AND "approvalStatus" = 'approved';

-- SubCategory + Active + Approved composite index
CREATE INDEX IF NOT EXISTS idx_listing_subcategory_active_approved ON "Listing"(subCategory, isActive, approvalStatus, expiresAt) 
WHERE "isActive" = true AND "approvalStatus" = 'approved';

-- CreatedAt index (sıralama için)
CREATE INDEX IF NOT EXISTS idx_listing_created_at ON "Listing"(createdAt DESC);

-- Views index (analytics için)
CREATE INDEX IF NOT EXISTS idx_listing_views ON "Listing"(views DESC);

-- ANALYZE komutu - PostgreSQL'in query planner'ına yardımcı olur
ANALYZE "Listing";

