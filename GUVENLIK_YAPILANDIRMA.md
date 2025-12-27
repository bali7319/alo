# Güvenlik Yapılandırması - Son Adımlar

## ✅ Mevcut Durum

- ✅ Fail2ban kuruldu
- ⚠️ UFW (Firewall) kapalı
- ✅ Sistem durumu: İyi (CPU %1.4, Bellek 87MB/7.8GB)

## 🔧 Fail2ban Başlatma

```bash
# Fail2ban'ı başlat
systemctl start fail2ban
systemctl enable fail2ban

# Durum kontrolü
systemctl status fail2ban

# Fail2ban durumu
fail2ban-client status
```

## 🛡️ Firewall (UFW) Yapılandırması

### 1. Firewall'u Aktif Et

```bash
# SSH portunu aç (ÖNEMLİ - önce bunu yap!)
ufw allow OpenSSH

# HTTP ve HTTPS portlarını aç
ufw allow 80/tcp
ufw allow 443/tcp

# Firewall'u aktif et
ufw --force enable

# Durum kontrolü
ufw status verbose
```

### 2. Firewall Kurallarını Kontrol Et

```bash
# Detaylı durum
ufw status verbose

# Kuralları numaralı listele
ufw status numbered
```

## ✅ Güvenlik Kontrolü

```bash
# Fail2ban durumu
fail2ban-client status

# Firewall durumu
ufw status

# Aktif portlar
netstat -tulpn | grep LISTEN
```

## 📝 Hızlı Komutlar (Kopyala-Yapıştır)

```bash
# Fail2ban başlat
systemctl start fail2ban
systemctl enable fail2ban
fail2ban-client status

# Firewall yapılandır
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose
```

