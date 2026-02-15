# Sunucuya deploy (SSH ile)

Kod GitHub’a push edildi. Deploy işlemini **sunucuda** yapman gerekiyor.

## 1) Sunucuya bağlan

SSH kullanıcı adını kendi kullanıcına göre değiştir (örn. `root`, `ubuntu`, `alo`):

```bash
ssh -p 2222 KULLANICI_ADIN@37.148.210.158
```

Şifre veya SSH key ile giriş yap. “Permission denied (publickey)” alıyorsan:
- Doğru kullanıcı adını kullandığından emin ol,
- SSH key’i sunucuya ekle: `ssh-copy-id -p 2222 KULLANICI_ADIN@37.148.210.158`

## 2) Sunucuda proje klasörüne gir

Proje sunucuda `/var/www/alo17` dizininde:

```bash
cd /var/www/alo17
```

## 3) Deploy komutları (hepsi sunucuda)

```bash
git pull origin main
npm ci --include=dev --no-audit --no-fund
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart alo17
```

`prisma migrate deploy` bekleyen migration’ları (örn. nöbetçi eczane tablosu) veritabanına uygular.

## 4) Kontrol

```bash
pm2 status
pm2 logs alo17 --lines 30
```

Tarayıcıda: https://alo17.tr/admin/eticaret/entegrasyonlar

---

**Not:** `cd /path/to/alo` ifadesi **sunucudaki** proje yolu için örnektir. Bu komutları Windows’ta değil, SSH ile bağlandığın sunucuda çalıştır.
