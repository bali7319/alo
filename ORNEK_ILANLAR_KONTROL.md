# "Örnek İlan" Kontrol ve Silme

## 🔍 Durum

Admin kullanıcısının sadece 2 ilanı var, ama ekranda çok fazla "Örnek İlan" görünüyor. Bu demek ki bu ilanlar başka kullanıcılara ait olabilir.

## ✅ Çözüm: Detaylı Kontrol

### 1. "Örnek İlan" İçeren Tüm İlanları Kontrol Et

```bash
cd /var/www/alo17
node scripts/check-ornek-ilanlar-detayli.js
```

Bu script:
- "Örnek İlan" içeren TÜM ilanları bulur
- Hangi kullanıcılara ait olduğunu gösterir
- Kullanıcılara göre gruplar
- Admin'in kaç "Örnek İlan"ı olduğunu gösterir

### 2. Tüm "Örnek İlan"ları Sil

Eğer tüm "Örnek İlan"ları silmek istiyorsanız (hangi kullanıcıya ait olursa olsun):

```bash
cd /var/www/alo17
node scripts/delete-all-ornek-ilanlar.js
```

Bu script:
- "Örnek İlan" içeren TÜM ilanları bulur
- Onay ister (EVET yazmanız gerekir)
- İlişkili kayıtları temizler
- İlanları siler

## 📋 Script'leri Sunucuya Aktar

```powershell
cd C:\Users\bali\Desktop\alo
scp scripts/check-ornek-ilanlar-detayli.js root@alo17.tr:/var/www/alo17/scripts/
scp scripts/delete-all-ornek-ilanlar.js root@alo17.tr:/var/www/alo17/scripts/
```

## 🎯 Öneri

1. Önce `check-ornek-ilanlar-detayli.js` ile kontrol edin
2. Hangi kullanıcılara ait olduğunu görün
3. Sonra `delete-all-ornek-ilanlar.js` ile tümünü silin

