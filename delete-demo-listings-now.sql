-- Demo ilanları kontrol et ve sil
-- Önce hangi ilanların silineceğini göster
SELECT id, title, category, "approvalStatus", "isActive", "createdAt"
FROM "Listing" 
WHERE 
  title ILIKE '%örnek%' OR 
  title ILIKE '%demo%' OR 
  title ILIKE '%test%' OR
  title ILIKE '%Örnek%' OR
  title ILIKE '%Demo%' OR
  title ILIKE '%Test%'
ORDER BY "createdAt" DESC;

-- Demo ilanları sil
DELETE FROM "Listing" 
WHERE 
  title ILIKE '%örnek%' OR 
  title ILIKE '%demo%' OR 
  title ILIKE '%test%' OR
  title ILIKE '%Örnek%' OR
  title ILIKE '%Demo%' OR
  title ILIKE '%Test%';

-- Kalan demo ilan sayısını kontrol et (0 olmalı)
SELECT COUNT(*) as "Kalan demo ilan sayısı" 
FROM "Listing" 
WHERE 
  title ILIKE '%örnek%' OR 
  title ILIKE '%demo%' OR 
  title ILIKE '%test%' OR
  title ILIKE '%Örnek%' OR
  title ILIKE '%Demo%' OR
  title ILIKE '%Test%';

