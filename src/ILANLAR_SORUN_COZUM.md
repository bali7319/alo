# İlanlar Sayfası Sorun Çözümü

## 🔍 Sorun

`https://alo17.tr/ilanlar` sayfasında tüm ilanlar görünmüyor.

## 🔎 Olası Nedenler

1. **API Filtreleri Çok Kısıtlayıcı:**
   - `isActive: true` - Sadece aktif ilanlar
   - `approvalStatus: 'approved'` - Sadece onaylanmış ilanlar
   - `expiresAt: { gt: new Date() }` - Süresi dolmamış ilanlar
   - Admin kullanıcısının ilanları hariç tutuluyor

2. **Client-Side Hata:**
   - Fetch hatası
   - Response parse hatası
   - Error handling eksik

3. **Veritabanı Sorunu:**
   - İlanlar gerçekten yok
   - Filtreler hiçbir ilanı eşleştirmiyor

## ✅ Yapılan İyileştirmeler

### 1. Client-Side Error Handling İyileştirildi

**Dosya:** `src/app/ilanlar/page.tsx`

**Değişiklikler:**
- ✅ Detaylı console.log'lar eklendi
- ✅ Error handling iyileştirildi
- ✅ Response validation eklendi
- ✅ Kullanıcıya daha iyi hata mesajları gösteriliyor
- ✅ "Sayfayı Yenile" butonu eklendi

**Yeni Özellikler:**
```typescript
// API isteği detaylı log'lama
console.log('[İlanlar] API isteği:', apiUrl);
console.log('[İlanlar] API response status:', response.status);
console.log('[İlanlar] API data:', { 
  listingsCount: data.listings?.length || 0, 
  total: data.pagination?.total || 0,
  totalPages: data.pagination?.totalPages || 0
});
```

### 2. API Debug Log'ları Eklendi

**Dosya:** `src/app/api/listings/route.ts`

**Değişiklikler:**
- ✅ Toplam aktif ilan sayısı log'lanıyor
- ✅ Süresi dolmamış ilan sayısı log'lanıyor
- ✅ Filtre sonuçları detaylı log'lanıyor

**Yeni Debug Log'ları:**
```typescript
console.log(`[GET /api/listings] Debug - Toplam aktif ilan: ${totalActiveListings}, Süresi dolmamış: ${totalNonExpiredListings}`);
```

## 🔍 Sorun Tespiti Adımları

### 1. Browser Console Kontrolü

Sayfayı açın ve F12 ile Developer Tools'u açın. Console'da şunları kontrol edin:

```javascript
// Beklenen log'lar:
[İlanlar] API isteği: /api/listings?page=1&limit=20
[İlanlar] API response status: 200
[İlanlar] API data: { listingsCount: X, total: Y, totalPages: Z }
```

### 2. Network Tab Kontrolü

Network tab'ında `/api/listings` isteğini kontrol edin:
- Status: 200 OK olmalı
- Response body'de `listings` array'i olmalı
- `pagination` objesi olmalı

### 3. Server Log Kontrolü

Sunucuda PM2 log'larını kontrol edin:

```bash
pm2 logs alo17 --lines 100 | grep "GET /api/listings"
```

Beklenen log'lar:
```
[GET /api/listings] Request received
[GET /api/listings] Fetching page 1, limit 20, search: 
[GET /api/listings] Debug - Toplam aktif ilan: X, Süresi dolmamış: Y
[GET /api/listings] Found Z listings, total: W
```

## 🛠️ Olası Çözümler

### Çözüm 1: Filtreleri Gevşetmek

Eğer hiç ilan görünmüyorsa, filtreleri gevşetmek gerekebilir:

```typescript
// expiresAt filtresini kaldır (süresi dolmuş ilanlar da görünsün)
const baseWhere: Prisma.ListingWhereInput = {
  isActive: true,
  approvalStatus: 'approved',
  // expiresAt filtresi kaldırıldı
};
```

### Çözüm 2: Admin Filtresini Kaldırmak

Admin ilanları da görünsün istiyorsanız:

```typescript
// Admin filtresini kaldır
// if (adminUser) {
//   baseWhere.userId = { not: adminUser.id };
// }
```

### Çözüm 3: Approval Status Kontrolü

Onaylanmamış ilanlar varsa:

```typescript
// approvalStatus filtresini gevşet
const baseWhere: Prisma.ListingWhereInput = {
  isActive: true,
  // approvalStatus: 'approved', // Kaldırıldı
  expiresAt: {
    gt: new Date()
  }
};
```

## 📊 Test Senaryoları

### Test 1: API Doğrudan Test

```bash
curl https://alo17.tr/api/listings?page=1&limit=20
```

Beklenen response:
```json
{
  "listings": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": X,
    "totalPages": Y
  }
}
```

### Test 2: Browser Console Test

```javascript
fetch('/api/listings?page=1&limit=20')
  .then(r => r.json())
  .then(data => console.log('Listings:', data))
  .catch(err => console.error('Error:', err));
```

### Test 3: Veritabanı Kontrolü

```sql
-- Toplam aktif ilanlar
SELECT COUNT(*) FROM "Listing" WHERE "isActive" = true AND "approvalStatus" = 'approved';

-- Süresi dolmamış ilanlar
SELECT COUNT(*) FROM "Listing" 
WHERE "isActive" = true 
AND "approvalStatus" = 'approved' 
AND "expiresAt" > NOW();
```

## 🚀 Deploy Sonrası Kontrol

Deploy sonrası şunları kontrol edin:

1. **Browser Console:**
   - Hata var mı?
   - API isteği başarılı mı?
   - Data geliyor mu?

2. **Network Tab:**
   - API response 200 OK mu?
   - Response body doğru mu?

3. **Server Logs:**
   - API log'ları görünüyor mu?
   - Hata var mı?

## 📝 Notlar

- İlanlar sayfası client-side rendering kullanıyor
- API cache 60 saniye (s-maxage=60)
- Sayfalama 20 ilan/sayfa
- Admin ilanları varsayılan olarak gizli

## 🔗 İlgili Dosyalar

- `src/app/ilanlar/page.tsx` - İlanlar sayfası
- `src/app/api/listings/route.ts` - İlanlar API endpoint'i
- `src/components/listing-card.tsx` - İlan kartı komponenti
