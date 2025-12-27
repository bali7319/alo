# Node.js ve npm Kurulumu

## 📦 Node.js Kurulumu

### Yöntem 1: NodeSource Repository (ÖNERİLEN - Node.js 20)

```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Node.js kur
apt install -y nodejs

# Versiyon kontrolü
node -v
npm -v
```

### Yöntem 2: Ubuntu Repository (Daha Eski Versiyon)

```bash
# Node.js ve npm kur
apt install -y nodejs npm

# Versiyon kontrolü
node -v
npm -v
```

## ✅ Kurulum Sonrası

Node.js kurulduktan sonra:

```bash
# Node.js versiyonu (20.x olmalı)
node -v

# npm versiyonu
npm -v

# Proje klasörüne git
cd /var/www/alo17

# Bağımlılıkları kur
npm install
```

## 🎯 Hızlı Komutlar

```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Node.js kur
apt install -y nodejs

# Kontrol
node -v
npm -v
```

