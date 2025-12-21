# 🚀 Natro VPS Deployment - Özet

## Hangi İşletim Sistemi?

**✅ Ubuntu 22.04 LTS önerilir** (veya Ubuntu 20.04 LTS)

Neden Ubuntu?
- ✅ Uzun vadeli destek (LTS)
- ✅ Next.js ve Node.js ile mükemmel uyum
- ✅ Geniş topluluk desteği
- ✅ Güvenlik güncellemeleri
- ✅ Kolay kurulum ve yönetim

## 📚 Rehberler

1. **NATRO_QUICK_START.md** - Hızlı başlangıç (5 dakika)
2. **NATRO_DEPLOYMENT.md** - Detaylı rehber (tüm adımlar)

## ⚡ Hızlı Başlangıç

```bash
# 1. Sunucuya bağlan
ssh root@your-server-ip

# 2. Hızlı kurulum scripti çalıştır (manuel adımlar için NATRO_QUICK_START.md'ye bakın)
```

## 🔧 Önemli Notlar

### Veritabanı Değişikliği
- **Development**: SQLite kullanıyor (`prisma/dev.db`)
- **Production**: PostgreSQL kullanılmalı
- Prisma schema PostgreSQL için güncellendi
- `.env` dosyasında `DATABASE_URL` PostgreSQL connection string olmalı

### Dosyalar
- `ecosystem.config.js` - PM2 konfigürasyonu
- `deploy.sh` - Otomatik deployment scripti
- `prisma/schema.prisma` - PostgreSQL için güncellendi

## 📋 Kurulum Adımları Özeti

1. ✅ Ubuntu 22.04 LTS kur
2. ✅ Node.js 20.x kur
3. ✅ PostgreSQL kur ve veritabanı oluştur
4. ✅ Projeyi kopyala ve `.env` ayarla
5. ✅ `npm install` ve `npm run build`
6. ✅ PM2 ile başlat
7. ✅ Nginx reverse proxy ayarla
8. ✅ SSL sertifikası kur (Let's Encrypt)

## 🆘 Sorun mu var?

1. **NATRO_DEPLOYMENT.md** dosyasındaki "Sorun Giderme" bölümüne bakın
2. PM2 logları: `pm2 logs alo17`
3. Nginx logları: `tail -f /var/log/nginx/error.log`

## 📞 Destek

Detaylı bilgi için:
- **NATRO_DEPLOYMENT.md** - Tam rehber
- **NATRO_QUICK_START.md** - Hızlı başlangıç

