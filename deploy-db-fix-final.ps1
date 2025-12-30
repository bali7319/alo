# Database Fix - Final
Write-Host "SQL dosyası yükleniyor..." -ForegroundColor Green
scp "fix-database-manual.sql" root@alo17.tr:/var/www/alo17/

Write-Host "Sunucuda SQL çalıştırılıyor..." -ForegroundColor Green
Write-Host "Not: PostgreSQL şifresini girmeniz gerekecek" -ForegroundColor Yellow
ssh root@alo17.tr "cd /var/www/alo17 && PGPASSWORD=\$(grep DATABASE_URL .env | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/') psql -h localhost -U alo17_user -d alo17_db -f fix-database-manual.sql && npx prisma generate && pm2 restart alo17"

