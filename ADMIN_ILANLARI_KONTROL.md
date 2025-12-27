# Admin İlanları Kontrol ve Silme

## 🔍 Durum

Script çalıştırıldığında **0 ilan bulundu**. Bu, "Örnek İlan" içeren tüm ilanların **admin kullanıcısına ait** olduğunu gösteriyor.

## ✅ Çözüm: Admin'in Demo İlanlarını Kontrol Et

### 1. Admin İlanlarını Kontrol Et

```bash
cd /var/www/alo17
node scripts/check-admin-listings.js
```

Bu script:
- Admin kullanıcısının tüm ilanlarını listeler
- "Örnek İlan", "Demo", "Test" içeren ilanları gösterir
- Toplam sayıları verir

### 2. Admin'in Demo İlanlarını Sil

Eğer admin'in demo ilanlarını da silmek istiyorsanız:

```bash
cd /var/www/alo17
node scripts/delete-admin-demo-listings.js
```

Bu script:
- Admin kullanıcısının SADECE demo/örnek ilanlarını bulur
- Onay ister (EVET yazmanız gerekir)
- İlişkili kayıtları temizler
- İlanları siler

## 📋 Alternatif: Tüm Admin İlanlarını Sil

Eğer admin'in TÜM ilanlarını silmek istiyorsanız (önerilmez):

```bash
# PostgreSQL'de direkt sil
sudo -u postgres psql -d alo17_db << 'EOF'
DELETE FROM "UserFavorite" WHERE "listingId" IN (SELECT id FROM "Listing" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'admin@alo17.tr'));
UPDATE "Message" SET "listingId" = NULL WHERE "listingId" IN (SELECT id FROM "Listing" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'admin@alo17.tr'));
DELETE FROM "Report" WHERE "listingId" IN (SELECT id FROM "Listing" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'admin@alo17.tr'));
DELETE FROM "Listing" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'admin@alo17.tr');
\q
EOF
```

## ⚠️ Öneri

1. Önce `check-admin-listings.js` ile kontrol edin
2. Kaç tane demo ilan olduğunu görün
3. Sonra `delete-admin-demo-listings.js` ile sadece demo ilanları silin
4. Admin'in gerçek ilanları varsa onlar korunur

