$SERVER = "root@alo17.tr"

# 1. Jail dosyasını sunucuda oluştur (Next.js ve Nginx için optimize edildi)
$JAIL_CONF = @"
[nginx-http-auth]
enabled = true
port    = http,https
logpath = /var/log/nginx/error.log

[nginx-botsearch]
enabled = true
port    = http,https
logpath = /var/log/nginx/error.log
maxretry = 2

[nginx-limit-req]
enabled = true
port    = http,https
logpath = /var/log/nginx/error.log
"@

Write-Host "--- Fail2ban Jail ayarlari sunucuya gonderiliyor ---" -ForegroundColor Cyan

# Ayarları sunucudaki geçici bir dosyaya atalım
$JAIL_CONF | ssh $SERVER "cat > /etc/fail2ban/jail.d/nginx.local"

# 2. Servisi test et ve yeniden başlat
# NOT: PowerShell'de || yerine Linux tarafında çalışması için komutu tırnak içinde gönderiyoruz
Write-Host "--- Yapilandirma test ediliyor ve servis restart ediliyor ---" -ForegroundColor Yellow

ssh $SERVER "fail2ban-client status && systemctl restart fail2ban"

# 3. Durumu kontrol et
Write-Host "--- Guncel Fail2ban Durumu ---" -ForegroundColor Green
ssh $SERVER "fail2ban-client status"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Fail2ban Nginx korumasi aktif edildi! " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

