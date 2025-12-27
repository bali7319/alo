# Sunucuda Zararlı Yazılım Kontrolü

## 🔍 Hızlı Kontrol Komutları

### 1. Şüpheli Process'leri Kontrol Et

```bash
# Çalışan tüm process'leri listele
ps aux

# Şüpheli process'leri ara
ps aux | grep -E "\.update|miner|crypto|bitcoin|\.sh|wget|curl" | grep -v grep

# CPU kullanımına göre sırala
ps aux --sort=-%cpu | head -20

# Bellek kullanımına göre sırala
ps aux --sort=-%mem | head -20
```

### 2. Şüpheli Dosyaları Bul

```bash
# Gizli dosyaları bul (nokta ile başlayan)
find /root -name ".*" -type f -executable 2>/dev/null

# /usr/bin ve /usr/sbin'de gizli dosyalar
find /usr/bin /usr/sbin -name ".*" -type f 2>/dev/null

# Şüpheli isimli dosyalar
find / -name "*.update" -o -name ".update" 2>/dev/null
find / -name "*miner*" -o -name "*crypto*" 2>/dev/null

# Son 7 günde değiştirilmiş dosyalar
find /root /usr/bin /usr/sbin -type f -mtime -7 2>/dev/null
```

### 3. .bashrc ve .profile Kontrolü

```bash
# .bashrc'yi kontrol et
cat ~/.bashrc | grep -E "\.update|sleep|wget|curl|\.sh"

# .profile'ı kontrol et
cat ~/.profile | grep -E "\.update|sleep|wget|curl|\.sh"

# /etc/profile kontrolü
cat /etc/profile | grep -E "\.update|sleep|wget|curl|\.sh"

# Tüm profile dosyalarını kontrol et
grep -r "\.update\|sleep 30" /etc/profile* /root/.*rc /root/.*profile 2>/dev/null
```

### 4. Cron Job Kontrolü

```bash
# Root'un cron job'ları
crontab -l

# Tüm kullanıcıların cron job'ları
ls -la /var/spool/cron/crontabs/

# Sistem cron job'ları
ls -la /etc/cron.d/
ls -la /etc/cron.hourly/
ls -la /etc/cron.daily/
ls -la /etc/cron.weekly/
ls -la /etc/cron.monthly/

# Şüpheli cron job'ları ara
grep -r "\.update\|wget\|curl\|\.sh" /etc/cron* /var/spool/cron* 2>/dev/null
```

### 5. Network Bağlantılarını Kontrol Et

```bash
# Aktif network bağlantıları
netstat -tulpn

# Şüpheli bağlantılar
netstat -tulpn | grep -E "ESTABLISHED|LISTEN" | grep -v "127.0.0.1\|localhost"

# Dışarıya bağlantılar
netstat -tulpn | grep ESTABLISHED | awk '{print $5}' | cut -d: -f1 | sort | uniq

# ss komutu ile (daha detaylı)
ss -tulpn
```

### 6. Sistem Loglarını Kontrol Et

```bash
# Son başarısız giriş denemeleri
grep "Failed password" /var/log/auth.log | tail -20

# Son başarılı girişler
grep "Accepted password" /var/log/auth.log | tail -20

# Şüpheli komutlar
grep -E "wget|curl|\.sh|\.update" /var/log/auth.log | tail -20

# Sistem logları
journalctl -u ssh -n 50
```

### 7. Dosya İzinlerini Kontrol Et

```bash
# SUID biti olan dosyalar (şüpheli)
find /usr/bin /usr/sbin /bin /sbin -perm -4000 2>/dev/null

# SGID biti olan dosyalar
find /usr/bin /usr/sbin /bin /sbin -perm -2000 2>/dev/null

# Yazılabilir dosyalar (root için)
find /usr/bin /usr/sbin -type f -writable 2>/dev/null
```

### 8. Disk Kullanımını Kontrol Et

```bash
# Disk kullanımı
df -h

# Büyük dosyalar
find / -type f -size +100M 2>/dev/null | head -20

# /tmp klasörü kontrolü
ls -la /tmp
du -sh /tmp
```

## 🛡️ Kapsamlı Kontrol Script'i

Tüm kontrolleri tek seferde yapmak için:

```bash
#!/bin/bash
echo "=========================================="
echo "ZARARLI YAZILIM KONTROLÜ"
echo "=========================================="
echo ""

echo "=== 1. ŞÜPHELİ PROCESS'LER ==="
ps aux | grep -E "\.update|miner|crypto|bitcoin" | grep -v grep
echo ""

echo "=== 2. ŞÜPHELİ DOSYALAR ==="
find /root /usr/bin /usr/sbin -name ".*" -type f 2>/dev/null
find /root /usr/bin /usr/sbin -name "*.update" 2>/dev/null
echo ""

echo "=== 3. .bashrc KONTROLÜ ==="
grep -E "\.update|sleep|wget|curl" ~/.bashrc /etc/profile 2>/dev/null
echo ""

echo "=== 4. CRON JOB KONTROLÜ ==="
crontab -l
grep -r "\.update\|wget\|curl" /etc/cron* 2>/dev/null
echo ""

echo "=== 5. NETWORK BAĞLANTILARI ==="
netstat -tulpn | grep ESTABLISHED | grep -v "127.0.0.1"
echo ""

echo "=== 6. SON DEĞİŞTİRİLEN DOSYALAR ==="
find /root /usr/bin /usr/sbin -type f -mtime -7 2>/dev/null | head -20
echo ""

echo "=========================================="
echo "KONTROL TAMAMLANDI"
echo "=========================================="
```

## 🔧 Temizlik Komutları (Eğer Zararlı Yazılım Bulunursa)

### 1. Şüpheli Process'leri Durdur

```bash
# Process ID'yi bul
ps aux | grep şüpheli_process

# Process'i öldür
kill -9 [PID]

# Veya process adıyla
pkill -f şüpheli_process
```

### 2. Şüpheli Dosyaları Sil

```bash
# Dosyayı sil
rm -f /path/to/şüpheli_dosya

# Klasörü sil
rm -rf /path/to/şüpheli_klasör
```

### 3. .bashrc Temizle

```bash
# Yedek al
cp ~/.bashrc ~/.bashrc.backup

# Şüpheli satırları sil
sed -i '/\.update/d' ~/.bashrc
sed -i '/sleep 30/d' ~/.bashrc
sed -i '/wget.*\.sh/d' ~/.bashrc
sed -i '/curl.*\.sh/d' ~/.bashrc
```

### 4. Cron Job Temizle

```bash
# Cron job'ları listele
crontab -l

# Cron job'ları düzenle
crontab -e

# Şüpheli satırları sil
```

## ✅ Güvenlik Önlemleri

### 1. Fail2ban Kurulumu

```bash
# Fail2ban kur
apt install -y fail2ban

# Fail2ban başlat
systemctl start fail2ban
systemctl enable fail2ban

# Durum kontrolü
fail2ban-client status
```

### 2. Firewall Ayarları

```bash
# UFW durumunu kontrol et
ufw status

# Gerekli portları aç
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp

# Firewall'u aktif et
ufw --force enable
```

### 3. Düzenli Güncellemeler

```bash
# Sistem güncellemeleri
apt update
apt upgrade -y

# Güvenlik güncellemeleri
apt install unattended-upgrades
```

## 🎯 Hızlı Kontrol (Kopyala-Yapıştır)

SSH terminal'inde şu komutları çalıştırın:

```bash
# Şüpheli process'ler
ps aux | grep -E "\.update|miner|crypto" | grep -v grep

# Şüpheli dosyalar
find /root /usr/bin -name ".*" -type f 2>/dev/null

# .bashrc kontrolü
grep -E "\.update|sleep" ~/.bashrc /etc/profile 2>/dev/null

# Cron job'lar
crontab -l
grep -r "\.update" /etc/cron* 2>/dev/null

# Network bağlantıları
netstat -tulpn | grep ESTABLISHED | grep -v "127.0.0.1"
```

