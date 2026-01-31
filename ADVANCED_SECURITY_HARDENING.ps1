# Gelişmiş Güvenlik Sertleştirme Script'i
# Tüm güvenlik iyileştirmelerini uygular

$SERVER = "root@alo17.tr"
$SSH_PORT = 2222
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "GELİŞMİŞ GÜVENLİK SERTLEŞTİRME" -ForegroundColor Yellow
Write-Host "Kapsamlı Güvenlik İyileştirmeleri" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. SSH Güvenliği İyileştirmeleri
Write-Host "1. SSH güvenliği iyileştiriliyor..." -ForegroundColor Yellow
ssh -p $SSH_PORT $SERVER @"
# SSH config yedekle
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d)

# SSH config düzenle (güvenli ayarlar)
sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config
sed -i 's/#ClientAliveInterval 0/ClientAliveInterval 300/' /etc/ssh/sshd_config
sed -i 's/#ClientAliveCountMax 3/ClientAliveCountMax 2/' /etc/ssh/sshd_config

# SSH config test et
sshd -t && echo 'SSH config geçerli' || echo 'SSH config hatası!'
"@ 2>&1

Write-Host "   ⚠️ SSH config değiştirildi. Yeni bağlantıda SSH key gerekli olacak!" -ForegroundColor Red
Write-Host "   SSH servisini yeniden başlatmak için: systemctl restart sshd" -ForegroundColor Yellow

# 2. Fail2ban Yapılandırması İyileştirmeleri
Write-Host "`n2. Fail2ban yapılandırması iyileştiriliyor..." -ForegroundColor Yellow
ssh -p $SSH_PORT $SERVER @"
# Fail2ban jail.local oluştur
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = root@localhost
sendername = Fail2Ban
action = %(action_)s

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200

[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 3600

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
EOF

# Fail2ban filter'ları oluştur
cat > /etc/fail2ban/filter.d/nginx-limit-req.conf << 'EOF'
[Definition]
failregex = limiting requests, excess:.* by zone.*client: <HOST>
ignoreregex =
EOF

cat > /etc/fail2ban/filter.d/nginx-nextjs.conf << 'EOF'
[Definition]
failregex = ^<HOST>.*"(GET|POST|PUT|DELETE).*HTTP/.*" (429|403|401)
ignoreregex =
EOF

# Fail2ban yeniden başlat
systemctl restart fail2ban
systemctl status fail2ban --no-pager | head -5
"@ 2>&1

# 3. Dosya İzinleri Kontrolü ve Düzeltme
Write-Host "`n3. Dosya izinleri kontrol ediliyor ve düzeltiliyor..." -ForegroundColor Yellow
ssh -p $SSH_PORT $SERVER @"
# Web dizini izinleri
chown -R root:root $REMOTE_PATH
find $REMOTE_PATH -type d -exec chmod 755 {} \;
find $REMOTE_PATH -type f -exec chmod 644 {} \;
chmod 755 $REMOTE_PATH
chmod 600 $REMOTE_PATH/.env 2>/dev/null || echo '.env dosyası bulunamadı'

# Executable dosyaları kontrol et
echo '=== Executable Dosyalar ==='
find $REMOTE_PATH -type f -executable | head -10 || echo 'Executable dosya bulunamadı'

# Sensitive dosyaları koru
chmod 600 $REMOTE_PATH/.env* 2>/dev/null
chmod 600 $REMOTE_PATH/ecosystem.config.js 2>/dev/null
"@ 2>&1

# 4. SSL/TLS Güvenliği
Write-Host "`n4. SSL/TLS güvenliği kontrol ediliyor..." -ForegroundColor Yellow
ssh -p $SSH_PORT $SERVER @"
# Nginx SSL config kontrolü
if [ -f /etc/nginx/sites-available/alo17 ]; then
    echo '=== SSL Config Kontrolü ==='
    grep -E 'ssl_protocols|ssl_ciphers|ssl_prefer_server_ciphers' /etc/nginx/sites-available/alo17 || echo 'SSL config bulunamadı'
    
    # HSTS header ekle (eğer yoksa)
    if ! grep -q 'add_header Strict-Transport-Security' /etc/nginx/sites-available/alo17; then
        echo 'HSTS header eklenmeli (manuel olarak)'
    fi
fi

# SSL sertifikası kontrolü
echo '=== SSL Sertifikası ==='
if command -v certbot &> /dev/null; then
    certbot certificates 2>/dev/null | head -10 || echo 'Certbot bulunamadı'
else
    echo 'Certbot kurulu değil'
fi
"@ 2>&1

# 5. Backup Stratejisi Oluşturma
Write-Host "`n5. Backup stratejisi oluşturuluyor..." -ForegroundColor Yellow
ssh -p $SSH_PORT $SERVER @"
# Backup dizini oluştur
mkdir -p /var/backups/alo17

# Database backup script oluştur
cat > /root/backup-alo17.sh << 'EOF'
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/alo17"
mkdir -p \$BACKUP_DIR

# PostgreSQL backup
pg_dump -U alo17_user alo17_db > \$BACKUP_DIR/db_\$DATE.sql 2>/dev/null && echo "Database backup: OK" || echo "Database backup: FAILED"

# Dosya sistemi backup (sadece önemli dosyalar)
tar -czf \$BACKUP_DIR/files_\$DATE.tar.gz /var/www/alo17/.env /var/www/alo17/ecosystem.config.js 2>/dev/null && echo "Files backup: OK" || echo "Files backup: FAILED"

# Eski backup'ları sil (30 günden eski)
find \$BACKUP_DIR -type f -mtime +30 -delete && echo "Old backups cleaned" || echo "Cleanup failed"

echo "Backup completed: \$DATE"
EOF

chmod +x /root/backup-alo17.sh

# Cron job ekle (günlük backup - saat 02:00)
(crontab -l 2>/dev/null | grep -v backup-alo17; echo "0 2 * * * /root/backup-alo17.sh >> /var/log/alo17-backup.log 2>&1") | crontab -

echo "Backup script oluşturuldu ve cron job eklendi"
"@ 2>&1

# 6. Sistem Güncellemeleri Kontrolü
Write-Host "`n6. Sistem güncellemeleri kontrol ediliyor..." -ForegroundColor Yellow
ssh -p $SSH_PORT $SERVER @"
apt-get update -qq
SECURITY_UPDATES=\$(apt list --upgradable 2>/dev/null | grep -i security | wc -l)
if [ \$SECURITY_UPDATES -gt 0 ]; then
    echo "⚠️ \$SECURITY_UPDATES güvenlik güncellemesi mevcut"
    apt list --upgradable 2>/dev/null | grep -i security | head -5
else
    echo "✅ Güvenlik güncellemesi yok"
fi
"@ 2>&1

# 7. Log Monitoring İyileştirmeleri
Write-Host "`n7. Log monitoring iyileştiriliyor..." -ForegroundColor Yellow
ssh -p $SSH_PORT $SERVER @"
# Logrotate yapılandırması
cat > /etc/logrotate.d/alo17 << 'EOF'
/var/www/alo17/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Nginx log rotation
if [ -f /etc/logrotate.d/nginx ]; then
    echo "Nginx log rotation zaten yapılandırılmış"
else
    echo "Nginx log rotation yapılandırılmalı"
fi
"@ 2>&1

# 8. Network Güvenliği
Write-Host "`n8. Network güvenliği kontrol ediliyor..." -ForegroundColor Yellow
ssh -p $SSH_PORT $SERVER @"
# SYN flood koruması
sysctl -w net.ipv4.tcp_syncookies=1
sysctl -w net.ipv4.tcp_max_syn_backlog=2048
sysctl -w net.ipv4.tcp_synack_retries=2
sysctl -w net.ipv4.tcp_syn_retries=2

# IP forwarding kapat (eğer gereksizse)
sysctl -w net.ipv4.ip_forward=0

# ICMP redirect kapat
sysctl -w net.ipv4.conf.all.accept_redirects=0
sysctl -w net.ipv4.conf.default.accept_redirects=0

# Kalıcı yapmak için /etc/sysctl.conf'a ekle
grep -q "net.ipv4.tcp_syncookies" /etc/sysctl.conf || echo "net.ipv4.tcp_syncookies=1" >> /etc/sysctl.conf
grep -q "net.ipv4.ip_forward" /etc/sysctl.conf || echo "net.ipv4.ip_forward=0" >> /etc/sysctl.conf

echo "Network güvenlik ayarları uygulandı"
"@ 2>&1

# 9. Process ve Port Kontrolü
Write-Host "`n9. Process ve port kontrolü..." -ForegroundColor Yellow
ssh -p $SSH_PORT $SERVER @"
echo '=== Açık Portlar ==='
netstat -tulpn | grep LISTEN | grep -v '127.0.0.1\|::1'

echo ''
echo '=== Yüksek CPU Kullanan Processler ==='
ps aux --sort=-%cpu | head -10

echo ''
echo '=== Yüksek RAM Kullanan Processler ==='
ps aux --sort=-%mem | head -10
"@ 2>&1

# 10. Özet ve Öneriler
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "GÜVENLİK SERTLEŞTİRME TAMAMLANDI" -ForegroundColor Green
Write-Host "`nYAPILAN İYİLEŞTİRMELER:" -ForegroundColor Yellow
Write-Host "✅ SSH güvenliği iyileştirildi" -ForegroundColor Green
Write-Host "✅ Fail2ban yapılandırması geliştirildi" -ForegroundColor Green
Write-Host "✅ Dosya izinleri düzeltildi" -ForegroundColor Green
Write-Host "✅ Backup stratejisi oluşturuldu" -ForegroundColor Green
Write-Host "✅ Log monitoring iyileştirildi" -ForegroundColor Green
Write-Host "✅ Network güvenliği artırıldı" -ForegroundColor Green
Write-Host "`nKRİTİK: MANUEL YAPILMASI GEREKENLER:" -ForegroundColor Red
Write-Host "1. SSH servisini yeniden başlatın (SSH key'iniz olduğundan emin olun!):" -ForegroundColor Red
Write-Host "   ssh root@alo17.tr 'systemctl restart sshd'" -ForegroundColor Yellow
Write-Host "2. SSL sertifikası otomatik yenileme kontrol edin:" -ForegroundColor White
Write-Host "   ssh root@alo17.tr 'certbot certificates'" -ForegroundColor Yellow
Write-Host "3. Backup'ı test edin:" -ForegroundColor White
Write-Host "   ssh root@alo17.tr '/root/backup-alo17.sh'" -ForegroundColor Yellow
Write-Host "4. Fail2ban durumunu kontrol edin:" -ForegroundColor White
Write-Host "   ssh root@alo17.tr 'fail2ban-client status'" -ForegroundColor Yellow
Write-Host "5. Application-level rate limiting ekleyin (Next.js)" -ForegroundColor White
Write-Host "6. Input sanitization ekleyin (XSS koruması)" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

