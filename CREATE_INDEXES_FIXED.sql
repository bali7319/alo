-- Önce tablo yapısını kontrol edin: \d "Listing"
-- Column isimlerini doğru yazın (camelCase veya snake_case olabilir)

-- Eğer column isimleri camelCase ise (Prisma default):
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

