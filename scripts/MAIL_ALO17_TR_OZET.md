# Mail: mail.kurumsaleposta.com + destek@alo17.tr – Özet ve Kontrol

## 1. Güncel ayarlar (hepsi uyumlu)

| Ayar      | Değer              | Nerede |
|-----------|--------------------|--------|
| SMTP_HOST | mail.kurumsaleposta.com | .env, .env.postgres.example, sunucu .env |
| SMTP_PORT | 587                | Tümü |
| SMTP_USER | destek@alo17.tr    | Tümü |
| SMTP_FROM | destek@alo17.tr    | Tümü |
| SMTP_PASS | (ayarlı, gizli)    | Sunucu .env’de var |

Sunucuda (`/var/www/alo17/.env`) **SMTP_HOST=mail.kurumsaleposta.com**, **SMTP_USER=destek@alo17.tr**, **SMTP_FROM=destek@alo17.tr**, **SMTP_PASS** tanımlı olmalı.

---

## 2. Sunucudan bağlantı testi

- **DNS:** `mail.alo17.tr` sunucuda çözülemiyor → **NXDOMAIN** (kayıt yok).
- **Port 587:** Host çözülemediği için bağlantı testi yapılamadı.

Yapılacak: **mail.alo17.tr** için DNS’te bir **A** veya **CNAME** kaydı ekleyin.

- A kaydı: `mail.alo17.tr` → Mail sunucusunun IP’si (örn. kurumsal e-posta sunucusu).
- CNAME: `mail.alo17.tr` → `mail.kurumsaleposta.com` (sağlayıcı izin veriyorsa).

DNS yayıldıktan sonra sunucuda tekrar test:

```bash
ssh -p 2222 root@alo17.tr "cd /var/www/alo17 && bash scripts/check-smtp-from-server.sh"
```

---

## 3. Şifre (SMTP_PASS) kontrolü

Şifrenin doğru olduğundan emin olmak için:

1. **Webmail ile:** destek@alo17.tr ile (kurumsal e-posta paneli / webmail) giriş yapın. Giriş başarılıysa aynı şifre SMTP için de kullanılabilir.
2. **DNS hazır olduktan sonra uygulama ile:**
   - Admin girişi yapıp **https://alo17.tr/admin/test-email** sayfasından test maili gönderin.
   - Veya admin iken **GET https://alo17.tr/api/test/smtp-check** çağrısı yapın (transporter.verify() çalışır; başarısız auth’ta hata döner).

Şifre yanlışsa tipik hata: `Invalid login` / `Authentication failed` / `535 5.7.8 Error: authentication failed`.

Sunucudaki şifreyi değiştirmek için:

```bash
ssh -p 2222 root@alo17.tr "cd /var/www/alo17 && nano .env"
# SMTP_PASS=... satırını yeni şifre ile güncelleyin, kaydedin.
# Ardından:
ssh -p 2222 root@alo17.tr "cd /var/www/alo17 && pm2 restart alo17 --update-env"
```

---

## 4. Özet adımlar

1. **mail.alo17.tr** için DNS A veya CNAME kaydını ekleyin.
2. DNS yayıldıktan sonra sunucuda `nc -zv -w5 mail.alo17.tr 587` ile portu test edin.
3. Şifreyi webmail ile doğrulayın; gerekirse .env’deki SMTP_PASS’i güncelleyip `pm2 restart alo17 --update-env` yapın.
4. Admin panelinden **Test E-posta** veya **/api/test/smtp-check** ile SMTP bağlantı ve kimlik doğrulamasını test edin.
