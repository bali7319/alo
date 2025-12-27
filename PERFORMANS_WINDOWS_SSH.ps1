# Windows PowerShell için SSH Komutu
# Kullanım: .\PERFORMANS_WINDOWS_SSH.ps1

# Sunucu bilgilerini buraya girin
$server = "root@alo17.tr"  # VEYA: "ubuntu@ip-adresi" veya "user@hostname"
$projectPath = "/var/www/alo17"
$dbName = "alo17_db"

Write-Host "🚀 Performans iyileştirmeleri başlatılıyor..." -ForegroundColor Green
Write-Host "📡 Sunucu: $server" -ForegroundColor Cyan

# SQL komutlarını dosyaya yaz
$sqlCommands = @"
CREATE INDEX IF NOT EXISTS idx_listing_category ON "Listing"(category);
CREATE INDEX IF NOT EXISTS idx_listing_subcategory ON "Listing"(subCategory);
CREATE INDEX IF NOT EXISTS idx_listing_active ON "Listing"(isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium ON "Listing"(isPremium, isActive);
CREATE INDEX IF NOT EXISTS idx_listing_created ON "Listing"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_listing_user ON "Listing"(userId);
CREATE INDEX IF NOT EXISTS idx_listing_expires ON "Listing"(expiresAt);
CREATE INDEX IF NOT EXISTS idx_listing_category_active ON "Listing"(category, isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_listing_premium_active ON "Listing"(isPremium, isActive, approvalStatus, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_listing_category_subcategory ON "Listing"(category, subCategory, isActive, approvalStatus);
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
"@

# Geçici dosya oluştur
$tempFile = [System.IO.Path]::GetTempFileName()
$sqlCommands | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "📊 Database index'leri oluşturuluyor..." -ForegroundColor Yellow

# SSH ile komut çalıştır
$command = @"
cd $projectPath && 
sudo -u postgres psql -d $dbName -f - < /dev/stdin << 'SQL_EOF'
$sqlCommands
SQL_EOF
npx prisma generate && 
npm run build && 
pm2 restart alo17 && 
pm2 status
"@

ssh $server $command

# Geçici dosyayı sil
Remove-Item $tempFile -ErrorAction SilentlyContinue

Write-Host "✅ Tamamlandı!" -ForegroundColor Green

