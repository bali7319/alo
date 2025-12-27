#!/bin/bash
# Veritabanındaki tüm ilanları kontrol et

echo "Veritabanındaki tüm ilanlar:"
sudo -u postgres psql -d alo17_db -c "SELECT id, title, category, \"approvalStatus\", \"isActive\", \"createdAt\" FROM \"Listing\" ORDER BY \"createdAt\" DESC LIMIT 50;"

echo ""
echo "Toplam ilan sayısı:"
sudo -u postgres psql -d alo17_db -c "SELECT COUNT(*) as total FROM \"Listing\";"

echo ""
echo "Aktif ve onaylanmış ilanlar:"
sudo -u postgres psql -d alo17_db -c "SELECT COUNT(*) as active_approved FROM \"Listing\" WHERE \"isActive\" = true AND \"approvalStatus\" = 'approved';"

