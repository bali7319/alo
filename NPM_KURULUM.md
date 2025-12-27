# npm Kurulumu

## 📦 npm Kur

```bash
# npm kur
apt install -y npm

# Versiyon kontrolü
npm -v
node -v
```

## ⚠️ Node.js Versiyonu

Mevcut Node.js versiyonu: 10.19.0 (eski)

Proje Node.js 20 gerektirebilir. Önce npm ile deneyin, hata alırsanız Node.js'i güncelleyin.

## 🔄 Node.js Güncelleme (Gerekirse)

Eğer npm install sırasında hata alırsanız:

```bash
# curl kur (gerekirse)
apt install -y curl

# NodeSource repository ekle (Node.js 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Node.js'i güncelle
apt install -y nodejs

# Kontrol
node -v
npm -v
```

## 🎯 Hızlı Komutlar

```bash
# npm kur
apt install -y npm

# Kontrol
npm -v
node -v

# Proje klasörüne git
cd /var/www/alo17

# Bağımlılıkları kur
npm install
```

