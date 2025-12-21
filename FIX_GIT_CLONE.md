# Git Clone Düzeltme

## ❌ Yanlış Komut
```bash
git clone https://github.com/your-username/alo17.git .
```

## ✅ Doğru Komut
```bash
git clone https://github.com/bali7319/alo.git .
```

## 🔧 Eğer Zaten Başladıysanız

1. **İptal et**: `Ctrl+C` tuşlarına basın

2. **Klasörü temizle** (eğer boş değilse):
```bash
cd /var/www/alo17
rm -rf * .git 2>/dev/null || true
```

3. **Doğru URL ile tekrar çek**:
```bash
git clone https://github.com/bali7319/alo.git .
```

## 📝 Notlar

- Repository **public** olduğu için şifre gerektirmez
- Eğer private repository olsaydı, Personal Access Token kullanmanız gerekirdi
- Doğru repository adı: `bali7319/alo` (alo17 değil, sadece "alo")

