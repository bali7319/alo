#!/bin/bash
# Demo ilanları silmek için script

echo "Tüm aktif ilanları kontrol ediliyor..."
sudo -u postgres psql -d alo17_db << 'EOF'
SELECT id, title, category, "approvalStatus", "isActive" 
FROM "Listing" 
WHERE "isActive" = true AND "approvalStatus" = 'approved' 
ORDER BY "createdAt" DESC 
LIMIT 50;
EOF

echo ""
echo "için kelimesi içeren ilanlar kontrol ediliyor..."
sudo -u postgres psql -d alo17_db << 'EOF'
SELECT id, title, category 
FROM "Listing" 
WHERE title ILIKE '%için%' 
ORDER BY "createdAt" DESC;
EOF

echo ""
echo "Demo ilanlar siliniyor..."
sudo -u postgres psql -d alo17_db << 'EOF'
DELETE FROM "Listing" 
WHERE title ILIKE '%için%' 
   OR title ILIKE '%örnek%' 
   OR title ILIKE '%demo%' 
   OR title ILIKE '%test%';
EOF

echo ""
echo "Kalan ilan sayısı:"
sudo -u postgres psql -d alo17_db << 'EOF'
SELECT COUNT(*) as "Toplam ilan sayısı" 
FROM "Listing" 
WHERE "isActive" = true AND "approvalStatus" = 'approved';
EOF

