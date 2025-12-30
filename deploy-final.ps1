# Final Deploy - Database Fix + Restart
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Final Deploy - Database Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SSH ile sunucuya bağlanıp şu komutları çalıştırın:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Database fix:" -ForegroundColor Green
Write-Host '   psql -U alo17_user -d alo17_db -c "ALTER TABLE \"Listing\" ADD COLUMN IF NOT EXISTS \"moderatorId\" TEXT, ADD COLUMN IF NOT EXISTS \"moderatedAt\" TIMESTAMP, ADD COLUMN IF NOT EXISTS \"moderatorNotes\" TEXT;"' -ForegroundColor Gray
Write-Host ""
Write-Host "2. Foreign key ekle:" -ForegroundColor Green
Write-Host '   psql -U alo17_user -d alo17_db -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = ''Listing_moderatorId_fkey'') THEN ALTER TABLE \"Listing\" ADD CONSTRAINT \"Listing_moderatorId_fkey\" FOREIGN KEY (\"moderatorId\") REFERENCES \"User\"(\"id\") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END \$\$;"' -ForegroundColor Gray
Write-Host ""
Write-Host "3. Prisma generate ve restart:" -ForegroundColor Green
Write-Host "   cd /var/www/alo17 && npx prisma generate && pm2 restart alo17" -ForegroundColor Gray
Write-Host ""
Write-Host "VEYA tek komut:" -ForegroundColor Yellow
Write-Host ""
$script = @'
cd /var/www/alo17
psql -U alo17_user -d alo17_db -c "ALTER TABLE \"Listing\" ADD COLUMN IF NOT EXISTS \"moderatorId\" TEXT, ADD COLUMN IF NOT EXISTS \"moderatedAt\" TIMESTAMP, ADD COLUMN IF NOT EXISTS \"moderatorNotes\" TEXT;"
psql -U alo17_user -d alo17_db -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Listing_moderatorId_fkey') THEN ALTER TABLE \"Listing\" ADD CONSTRAINT \"Listing_moderatorId_fkey\" FOREIGN KEY (\"moderatorId\") REFERENCES \"User\"(\"id\") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END \$\$;"
npx prisma generate
pm2 restart alo17
'@
Write-Host $script -ForegroundColor Cyan
Write-Host ""
Write-Host "SSH ile bağlanmak için:" -ForegroundColor Yellow
Write-Host "   ssh root@alo17.tr" -ForegroundColor Gray
Write-Host ""

