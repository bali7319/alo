# Güvenlik Kontrolü

## Tespit Edilen Şüpheli Aktivite

PM2 loglarında şüpheli bir dosya indirme girişimi tespit edildi:
- Dosya: `sh4.uhavenobotsxd`
- Tarih: 22 Aralık 2025, 12:49:52

## Kontrol Adımları

### 1. Şüpheli Dosyaları Kontrol Et

```bash
# /tmp klasöründe şüpheli dosyalar
ls -lah /tmp/ | grep -E "sh4|uhavenobots"

# /var/www/alo17 klasöründe şüpheli dosyalar
cd /var/www/alo17
find . -name "*uhavenobots*" -o -name "*sh4*"

# Tüm sistemde arama
find / -name "*uhavenobots*" 2>/dev/null
find / -name "*sh4*" 2>/dev/null | grep -v "/proc"
```

### 2. Çalışan Process'leri Kontrol Et

```bash
# Şüpheli process'ler
ps aux | grep -E "sh4|uhavenobots"

# Tüm node process'leri
ps aux | grep node

# PM2 process'leri
pm2 list
```

### 3. Cron Job'ları Kontrol Et

```bash
# Kullanıcı cron job'ları
crontab -l

# Root cron job'ları
sudo crontab -l

# Sistem cron job'ları
ls -lah /etc/cron.d/
cat /etc/cron.d/*
```

### 4. Sistem Loglarını Kontrol Et

```bash
# Auth logları (giriş denemeleri)
tail -50 /var/log/auth.log

# Syslog
tail -50 /var/log/syslog | grep -E "sh4|uhavenobots"

# PM2 logları (detaylı)
pm2 logs alo17 --err --lines 200 | grep -E "sh4|uhavenobots"
```

### 5. Network Bağlantılarını Kontrol Et

```bash
# Aktif network bağlantıları
netstat -tulpn | grep -v "127.0.0.1\|::1"

# Şüpheli IP'ler
ss -tulpn | grep ESTAB
```

### 6. Dosya İzinlerini Kontrol Et

```bash
# /var/www/alo17 klasörü izinleri
ls -lah /var/www/alo17/ | head -20

# Executable dosyalar
find /var/www/alo17 -type f -executable
```

## Önlemler

### 1. Güvenlik Duvarını Kontrol Et

```bash
# UFW durumu
ufw status verbose

# Sadece gerekli portları açık tutun
# Port 22 (SSH), 80 (HTTP), 443 (HTTPS)
```

### 2. Fail2Ban Kurulumu (Önerilir)

```bash
# Fail2Ban kurulumu
apt update
apt install -y fail2ban

# Fail2Ban durumu
systemctl status fail2ban
```

### 3. Düzenli Güvenlik Güncellemeleri

```bash
# Sistem güncellemeleri
apt update
apt list --upgradable

# Güvenlik güncellemeleri
apt upgrade -y
```

### 4. PM2 Loglarını Temizle (Opsiyonel)

Eğer loglar çok büyükse:

```bash
# PM2 loglarını temizle
pm2 flush alo17

# Veya log dosyalarını manuel temizle
> /var/www/alo17/logs/error.log
> /var/www/alo17/logs/out.log
```

## Sonuç

Eğer şüpheli bir aktivite bulursanız:
1. İlgili dosyaları silin
2. Şüpheli process'leri durdurun
3. Şifreleri değiştirin
4. Sistem güncellemelerini yapın
5. Güvenlik duvarını kontrol edin

