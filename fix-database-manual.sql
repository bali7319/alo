-- PostgreSQL için moderator kolonlarını ekle
-- Sunucuda çalıştırılacak SQL

-- Kolonları ekle (eğer yoksa)
ALTER TABLE "Listing" 
ADD COLUMN IF NOT EXISTS "moderatorId" TEXT,
ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "moderatorNotes" TEXT;

-- Foreign key constraint ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Listing_moderatorId_fkey'
    ) THEN
        ALTER TABLE "Listing" 
        ADD CONSTRAINT "Listing_moderatorId_fkey" 
        FOREIGN KEY ("moderatorId") 
        REFERENCES "User"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;

