# Natrohost IP Whitelist Talebi

## Sorun
**Hata:** `550 Relaying Blocked, add 94.73.187.1 to G_RELAY_ALLOW_IP`

**Neden:** Sunucu IP adresiniz (94.73.187.1) Natrohost SMTP sunucusu tarafından tanınmıyor.

## Çözüm: IP Whitelist Talebi

### 1. Natrohost Destek Ekibine Gönderilecek Talep

**Destek Paneli:** https://www.natrohost.com/destek

**Konu:** SMTP Relay IP Whitelist Talebi - 94.73.187.1

**Mesaj İçeriği:**
```
Merhaba Natrohost Destek Ekibi,

SMTP relay hatası alıyorum. Sunucu IP adresimin SMTP relay için whitelist'e eklenmesini rica ediyorum.

Detaylar:
- Sunucu IP Adresi: 94.73.187.1
- Email Adresi: destek@alo17.tr
- SMTP Host: mail.kurumsaleposta.com
- SMTP Port: 587
- Domain: alo17.tr

Hata Mesajı:
"550 relaying blocked, read new mail, add 94.73.187.1 to G_RELAY_ALLOW_IP or enable smtp authentication"

Not: SMTP authentication zaten aktif ve çalışıyor. Ancak IP whitelist'te olmadığı için relay engelleniyor.

Teşekkürler.
```

### 2. Alternatif: DNS SPF Kaydı Kontrolü

Eğer kendi domain'inizden email gönderiyorsanız, DNS'te SPF kaydını kontrol edin:

**SPF Kaydı Örneği:**
```
v=spf1 ip4:94.73.187.1 include:mail.kurumsaleposta.com ~all
```

**Kontrol Etmek İçin:**
```powershell
# DNS SPF kaydını kontrol et
nslookup -type=TXT alo17.tr
```

### 3. Email Ayarları Kontrolü

Email.ts dosyasında SMTP authentication zaten aktif:
- ✅ `auth: { user, pass }` - SMTP kimlik doğrulaması aktif
- ✅ `fromAddress` - SMTP_USER ile aynı kullanılıyor
- ✅ Port 587, STARTTLS: false (Natrohost ayarlarına uygun)

## Beklenen Sonuç

IP whitelist'e eklendikten sonra:
- ✅ Email gönderimi çalışacak
- ✅ "550 Relaying Blocked" hatası ortadan kalkacak
- ✅ Şifre sıfırlama email'leri gönderilebilecek

## Test Etmek İçin

IP whitelist'e eklendikten sonra:

1. Şifre sıfırlama emaili gönderin
2. Logları kontrol edin:
   ```powershell
   ssh root@alo17.tr "pm2 logs alo17 --lines 50 --nostream | grep -E '(email|Email|SMTP)'"
   ```
3. Başarılı mesaj: `📧 Email başarıyla gönderildi`

## Not

Bu sorun **mutlaka Natrohost destek ekibi tarafından çözülmelidir**. Kod tarafında yapılabilecek bir şey yok - IP whitelist sunucu tarafında yapılması gereken bir işlemdir.

