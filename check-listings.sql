-- Tüm aktif ilanları detaylı göster
SELECT id, title, category, "subCategory", "approvalStatus", "isActive", "createdAt"
FROM "Listing" 
WHERE "isActive" = true AND "approvalStatus" = 'approved'
ORDER BY "createdAt" DESC;

