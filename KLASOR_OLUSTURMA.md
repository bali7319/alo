# Proje Klasörü Oluşturma

## 📁 Klasör Oluştur

SSH terminal'inde:

```bash
# Proje klasörünü oluştur
mkdir -p /var/www/alo17

# Klasöre git
cd /var/www/alo17

# Klasör oluşturuldu mu kontrol et
pwd
ls -la
```

## 📦 Temel Klasör Yapısını Oluştur

```bash
cd /var/www/alo17

# Temel klasör yapısını oluştur
mkdir -p src/app/api
mkdir -p src/components
mkdir -p src/lib
mkdir -p prisma
mkdir -p public/images

# Kontrol et
ls -la
tree -L 2 -d 2>/dev/null || find . -type d | head -20
```

## 🚀 Sonraki Adım: Dosyaları Kopyala

Klasör oluşturulduktan sonra, yerel bilgisayardan dosyaları kopyalayın.

