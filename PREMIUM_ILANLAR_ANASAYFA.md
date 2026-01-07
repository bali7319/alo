# Premium İlanların Anasayfa Görünürlüğü

## Mevcut Durum

### 1. Premium İlanlar Nasıl Çekiliyor?
- **Dosya:** `src/app/page.tsx` ve `src/app/api/listings/homepage/route.ts`
- **Koşullar:**
  - `isPremium: true` ✅
  - `isActive: true` ✅
  - `approvalStatus: 'approved'` ✅
  - `expiresAt > şu anki tarih` ✅ (Süresi dolmamış ilanlar)

### 2. Sıralama
- **Mevcut:** `orderBy: { createdAt: 'desc' }` - En yeni premium ilanlar önce
- **Limit:** `take: 6` - Maksimum 6 premium ilan gösteriliyor

### 3. Görünürlük
- Premium ilanlar **"Öne Çıkan İlanlar"** (FeaturedAds) bölümünde gösteriliyor
- Anasayfanın üst kısmında, "Son Eklenen İlanlar" bölümünden önce

## İyileştirme Önerileri

### Seçenek 1: PremiumUntil'e Göre Sıralama
Premium süresi dolmak üzere olan ilanları önce göster (daha acil):
```typescript
orderBy: [
  { premiumUntil: 'asc' }, // Premium süresi yakın olanlar önce
  { createdAt: 'desc' }    // Sonra en yeni
]
```

### Seçenek 2: Views'e Göre Sıralama
En çok görüntülenen premium ilanları önce göster:
```typescript
orderBy: [
  { views: 'desc' },       // En çok görüntülenen önce
  { createdAt: 'desc' }    // Sonra en yeni
]
```

### Seçenek 3: PremiumUntil + Views Kombinasyonu
Premium süresi dolmak üzere olan ve en çok görüntülenen ilanları önce göster:
```typescript
orderBy: [
  { premiumUntil: 'asc' }, // Premium süresi yakın olanlar önce
  { views: 'desc' },      // Sonra en çok görüntülenen
  { createdAt: 'desc' }   // Son olarak en yeni
]
```

### Seçenek 4: Limit Artırma
Daha fazla premium ilan göster:
```typescript
take: 12  // 6 yerine 12 premium ilan
```

## Mevcut Kod Yapısı

**Anasayfa (`src/app/page.tsx`):**
- Premium ilanlar: `featuredListings` olarak gösteriliyor
- Normal ilanlar: `latestListings` olarak gösteriliyor

**API Endpoint (`src/app/api/listings/homepage/route.ts`):**
- Cache: 60 saniye TTL
- Premium ve latest listings paralel çekiliyor

## Önerilen İyileştirme

Premium ilanların daha etkili görünmesi için:
1. `premiumUntil` kontrolü eklenebilir (sadece premium süresi dolmamış olanlar)
2. Sıralama iyileştirilebilir (premiumUntil'e göre)
3. Limit artırılabilir (6'dan 12'ye)

Hangi iyileştirmeyi yapmak istersiniz?

