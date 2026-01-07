# SMTP Relay Hatası Çözümü

## Hata Mesajı
```
550 relaying blocked, read new mail, add 94.73.187.1 to G_RELAY_ALLOW_IP or enable smtp authentication
```

## Sorun
Natrohost SMTP sunucusu, sunucunuzun IP adresini (`94.73.187.1`) whitelist'te görmediği için email relay'ini engelliyor.

## Çözüm Seçenekleri

### Seçenek 1: IP Whitelist (ÖNERİLEN)
Natrohost destek ekibine şu bilgileri vererek IP'nizi whitelist'e ekletmelisiniz:

**Destek Talebi:**
```
Konu: SMTP Relay IP Whitelist Talebi

Merhaba,

SMTP relay hatası alıyorum. Sunucu IP adresimin whitelist'e eklenmesini rica ediyorum.

Sunucu IP: 94.73.187.1
Email Adresi: destek@alo17.tr
SMTP Host: mail.kurumsaleposta.com
Port: 587

Hata Mesajı:
"550 relaying blocked, add 94.73.187.1 to G_RELAY_ALLOW_IP"

Teşekkürler.
```

### Seçenek 2: SMTP Authentication Kontrolü
SMTP authentication'ın düzgün çalıştığından emin olmak için `email.ts` güncellendi.

## Yapılan Güncellemeler

1. ✅ `authMethod: 'LOGIN'` eklendi (transport seviyesinde)
2. ✅ SMTP authentication ayarları iyileştirildi
3. ✅ `email.ts` dosyası güncellendi

## Test Etmek İçin

1. `email.ts` dosyasını sunucuya yükleyin:
   ```powershell
   scp src/lib/email.ts root@alo17.tr:/var/www/alo17/src/lib/email.ts
   ```

2. Build ve restart:
   ```powershell
   ssh root@alo17.tr 'cd /var/www/alo17 && npm run build && pm2 restart alo17 --update-env'
   ```

3. Email gönderimini test edin.

## Not
Eğer hata devam ederse, **mutlaka Natrohost destek ekibine IP whitelist talebinde bulunun**. Bu, en güvenilir çözümdür.

