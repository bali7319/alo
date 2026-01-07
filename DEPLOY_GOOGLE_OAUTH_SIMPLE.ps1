# Google OAuth Credentials Deploy - Basit Versiyon
$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

$jsonPath = "C:\Users\bali\Downloads\client_secret_2_994791867914-6qsiuaag21nqvoms853n9rlkkhub0jap.apps.googleusercontent.com.json"
$json = Get-Content $jsonPath | ConvertFrom-Json

$clientId = $json.web.client_id
$clientSecret = $json.web.client_secret

Write-Host "Google OAuth Credentials Deploy..." -ForegroundColor Yellow

# Yedek al
ssh $SERVER "cd $REMOTE_PATH; cp .env .env.backup.`$(date +%Y%m%d_%H%M%S)" 2>&1 | Out-Null

# Client ID ekle/güncelle
ssh $SERVER "cd $REMOTE_PATH; echo 'GOOGLE_CLIENT_ID=$clientId' > /tmp/google_client_id.txt; if grep -q '^GOOGLE_CLIENT_ID=' .env; then sed -i 's|^GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=$clientId|' .env; else echo 'GOOGLE_CLIENT_ID=$clientId' >> .env; fi" 2>&1 | Out-Null

# Client Secret ekle/güncelle  
ssh $SERVER "cd $REMOTE_PATH; if grep -q '^GOOGLE_CLIENT_SECRET=' .env; then sed -i 's|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$clientSecret|' .env; else echo 'GOOGLE_CLIENT_SECRET=$clientSecret' >> .env; fi" 2>&1 | Out-Null

# NEXTAUTH_URL kontrolü
ssh $SERVER "cd $REMOTE_PATH; if ! grep -q '^NEXTAUTH_URL=.*alo17.tr' .env; then if grep -q '^NEXTAUTH_URL=' .env; then sed -i 's|^NEXTAUTH_URL=.*|NEXTAUTH_URL=https://alo17.tr|' .env; else echo 'NEXTAUTH_URL=https://alo17.tr' >> .env; fi; fi" 2>&1 | Out-Null

Write-Host "✓ Credentials eklendi" -ForegroundColor Green

# PM2 restart
ssh $SERVER "cd $REMOTE_PATH; pm2 restart alo17; pm2 save" 2>&1 | Out-Null
Write-Host "✓ PM2 yeniden başlatıldı" -ForegroundColor Green

Write-Host "Tamamlandı! Test: https://alo17.tr/giris" -ForegroundColor Cyan

