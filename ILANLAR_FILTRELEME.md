# İlanlar Sayfası Filtreleme Düzeltmesi

## 🔍 Sorun

`/ilanlar` sayfasında admin kullanıcısının "Örnek İlan"ları görünüyordu.

## ✅ Çözüm

`/api/listings` route'una admin kullanıcısının ilanlarını filtreleme eklendi.

### Değişiklik

**Dosya:** `src/app/api/listings/route.ts`

- Admin kullanıcısı bulunuyor
- Admin'in ilanları `where` clause'dan hariç tutuluyor
- Artık sadece gerçek kullanıcı ilanları görünecek

## 📦 Deploy

```powershell
cd C:\Users\bali\Desktop\alo
scp src/app/api/listings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/route.ts
```

```bash
ssh root@alo17.tr
cd /var/www/alo17
rm -rf .next
npm run build
pm2 restart alo17
```

## ✅ Sonuç

- Admin kullanıcısının ilanları artık `/ilanlar` sayfasında görünmeyecek
- Sadece gerçek kullanıcı ilanları görünecek
- Anasayfa zaten admin ilanlarını çekmiyor (images field'ı yok)

