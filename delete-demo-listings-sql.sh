#!/bin/bash
# Demo ilanları silmek için SQL komutları

echo "Demo ilanları kontrol ediliyor..."

# PostgreSQL'de demo ilanları bul ve sil
psql -U postgres -d alo17_db << EOF

-- Önce demo ilanları göster
SELECT id, title, category, "approvalStatus", "isActive" 
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

-- Silinen ilan sayısını göster
SELECT COUNT(*) as "Silinen ilan sayısı" 
FROM "Listing" 
WHERE 
  title ILIKE '%örnek%' OR 
  title ILIKE '%demo%' OR 
  title ILIKE '%test%' OR
  title ILIKE '%Örnek%' OR
  title ILIKE '%Demo%' OR
  title ILIKE '%Test%';

EOF

echo "Demo ilanlar silindi!"

