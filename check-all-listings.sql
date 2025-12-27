-- Tüm aktif ilanları listele
SELECT id, title, category, "approvalStatus", "isActive", "createdAt"
FROM "Listing" 
WHERE "isActive" = true AND "approvalStatus" = 'approved'
ORDER BY "createdAt" DESC
LIMIT 50;

-- "için" kelimesi içeren ilanları bul
SELECT id, title, category, "approvalStatus", "isActive"
FROM "Listing" 
WHERE title ILIKE '%için%'
ORDER BY "createdAt" DESC;

