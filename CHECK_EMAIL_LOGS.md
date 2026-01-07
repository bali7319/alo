# Email Loglarını Kontrol Etme

## PM2 Loglarını Kontrol Et

### 1. Son 100 satır log (email ile ilgili):
```bash
ssh root@alo17.tr 'pm2 logs alo17 --lines 100 --nostream | grep -E "(email|Email|EMAIL|smtp|SMTP|📧|❌)"'
```

### 2. Tüm son loglar:
```bash
ssh root@alo17.tr 'pm2 logs alo17 --lines 200 --nostream'
```

### 3. Sadece hata logları:
```bash
ssh root@alo17.tr 'pm2 logs alo17 --err --lines 50 --nostream'
```

### 4. Canlı log takibi (Ctrl+C ile çık):
```bash
ssh root@alo17.tr 'pm2 logs alo17 --lines 50'
```

## Email Gönderme Testi

Şifre sıfırlama emaili gönderildikten sonra logları kontrol edin. Şu mesajları arayın:

- `📧 Email başarıyla gönderildi:` - Email başarılı
- `❌ Email gönderme hatası:` - Email hatası
- `📧 [EMAIL SIMULATION]` - SMTP ayarları yok, simülasyon modu

## Sorun Giderme

Eğer "550 relaying blocked" hatası görüyorsanız:
- Sunucu IP'si (`94.73.187.1`) Natrohost'ta whitelist'te olmayabilir
- Natrohost destek ekibine IP whitelist talebinde bulunun

