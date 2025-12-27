# Node.js Güncelleme - Node.js 20 Kurulumu

## ⚠️ Sorun

Mevcut Node.js versiyonu: **10.19.0** (çok eski)
Proje gereksinimi: **Node.js 20.x**

## 🔄 Node.js 20 Kurulumu

### 1. Eski Node.js'i Kaldır (Opsiyonel)

```bash
# Eski Node.js'i kaldır
apt remove -y nodejs npm

# Veya sadece güncelle (önerilen)
```

### 2. NodeSource Repository Ekle

```bash
# curl kur (eğer yoksa)
apt install -y curl

# NodeSource repository ekle (Node.js 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
```

### 3. Node.js 20 Kur

```bash
# Node.js 20 kur
apt install -y nodejs

# Versiyon kontrolü
node -v
npm -v
```

### 4. npm Güncelle (Opsiyonel)

```bash
# npm'i en son versiyona güncelle
npm install -g npm@latest

# Kontrol
npm -v
```

## 🎯 Hızlı Komutlar (Kopyala-Yapıştır)

```bash
# curl kur
apt install -y curl

# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Node.js 20 kur
apt install -y nodejs

# Kontrol
node -v
npm -v
```

## ✅ Kurulum Sonrası

Node.js 20 kurulduktan sonra:

```bash
cd /var/www/alo17

# node_modules'ı temizle (eğer varsa)
rm -rf node_modules

# Bağımlılıkları tekrar kur
npm install
```

