# Sunucu İlk Kontrol - Şifre Değiştirildi ✅

## ✅ Şifre Başarıyla Değiştirildi!

Şimdi sunucu kurulumuna başlayalım.

## 📋 İlk Kontroller

### 1. Proje Klasörünü Kontrol Et

```bash
# Proje klasörüne git
cd /var/www/alo17

# Klasör var mı ve içinde ne var kontrol et
ls -la
```

### 2. Sistem Durumunu Kontrol Et

```bash
# Node.js versiyonu
node -v

# npm versiyonu
npm -v

# PM2 kurulu mu?
pm2 --version

# PostgreSQL durumu
systemctl status postgresql

# Nginx durumu
systemctl status nginx
```

### 3. Disk Alanını Kontrol Et

```bash
# Disk kullanımı
df -h

# Klasör boyutları
du -sh /var/www/alo17 2>/dev/null || echo "Klasör henüz oluşturulmamış"
```

## 🎯 Sonraki Adımlar

Eğer klasör boşsa veya yoksa:

1. **Dosyaları yerelden sunucuya kopyala** (WinSCP veya SCP ile)
2. **.env dosyası oluştur**
3. **PostgreSQL veritabanı oluştur**
4. **npm install** çalıştır
5. **Build yap**
6. **PM2 ile başlat**

## 📝 Hızlı Komutlar

```bash
# Klasör kontrolü
cd /var/www/alo17
ls -la

# Sistem bilgisi
node -v
npm -v
pm2 --version
```

