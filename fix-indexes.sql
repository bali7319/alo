-- Düzeltilmiş Performance Indexes
-- PostgreSQL'de column isimleri camelCase ve quoted olmalı
-- NOW() WHERE clause'da kullanılamaz (immutable değil)

CREATE INDEX IF NOT EXISTS idx_listing_category ON "Listing"(category);
CREATE INDEX IF NOT EXISTS idx_listing_subcategory ON "Listing"("subCategory");
CREATE INDEX IF NOT EXISTS idx_listing_active_approved ON "Listing"("isActive", "approvalStatus") WHERE "isActive" = true AND "approvalStatus" = 'approved';
CREATE INDEX IF NOT EXISTS idx_listing_expires_at ON "Listing"("expiresAt");
CREATE INDEX IF NOT EXISTS idx_listing_premium_active ON "Listing"("isPremium" DESC, "createdAt" DESC) WHERE "isActive" = true AND "approvalStatus" = 'approved';
CREATE INDEX IF NOT EXISTS idx_listing_user_id ON "Listing"("userId");
CREATE INDEX IF NOT EXISTS idx_listing_category_active_approved ON "Listing"(category, "isActive", "approvalStatus", "expiresAt") WHERE "isActive" = true AND "approvalStatus" = 'approved';
CREATE INDEX IF NOT EXISTS idx_listing_subcategory_active_approved ON "Listing"("subCategory", "isActive", "approvalStatus", "expiresAt") WHERE "isActive" = true AND "approvalStatus" = 'approved';
CREATE INDEX IF NOT EXISTS idx_listing_created_at ON "Listing"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_listing_views ON "Listing"(views DESC);
ANALYZE "Listing";

