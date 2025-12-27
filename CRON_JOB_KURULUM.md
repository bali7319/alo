# Cron Job Kurulum Rehberi

## Süresi Dolan İlanların Otomatik Yayından Kaldırılması

Bu sistem, süresi dolan ilanları gece 00:02'de otomatik olarak yayından kaldırır ve kullanıcıların profil sayfasında 7 gün boyunca görüntülenmesini sağlar.

## Kurulum Adımları

### 1. Environment Variable Ekleme

`.env` veya `.env.local` dosyanıza şu değişkeni ekleyin:

```env
CRON_SECRET=your-very-secure-random-secret-key-here
```

**Önemli:** Bu secret key'i güvenli bir şekilde oluşturun. Örnek:
```bash
openssl rand -base64 32
```

### 2. Vercel Deployment

Vercel'de deploy ederken:

1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. Settings > Environment Variables bölümüne gidin
4. `CRON_SECRET` değişkenini ekleyin
5. `vercel.json` dosyasındaki cron job otomatik olarak aktif olacaktır

### 3. Vercel.json Güncelleme

`vercel.json` dosyasındaki cron job path'ini güncelleyin:

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-listings?secret=YOUR_CRON_SECRET_HERE",
      "schedule": "2 0 * * *"
    }
  ]
}
```

**Not:** `YOUR_CRON_SECRET_HERE` kısmını `.env` dosyasındaki `CRON_SECRET` değeri ile değiştirin.

### 4. Alternatif: External Cron Service (Vercel dışında)

Eğer Vercel kullanmıyorsanız, external bir cron service kullanabilirsiniz:

#### Örnek: cron-job.org

1. [cron-job.org](https://cron-job.org) sitesine kaydolun
2. Yeni bir cron job oluşturun:
   - **URL:** `https://alo17.tr/api/cron/expire-listings?secret=YOUR_CRON_SECRET`
   - **Schedule:** Her gün 00:02 (Cron: `2 0 * * *`)
   - **Method:** GET veya POST

#### Örnek: EasyCron

1. [EasyCron](https://www.easycron.com) sitesine kaydolun
2. Yeni bir cron job oluşturun:
   - **URL:** `https://alo17.tr/api/cron/expire-listings?secret=YOUR_CRON_SECRET`
   - **Schedule:** Her gün 00:02

## Nasıl Çalışır?

1. **Gece 00:02'de:** Cron job çalışır ve süresi dolan tüm ilanları bulur
2. **İlanlar pasif yapılır:** `isActive: false` olarak güncellenir
3. **Profil sayfasında görünür:** Kullanıcılar profil sayfasında süresi dolmuş ilanlarını görebilir (7 gün boyunca)
4. **Tekrar yayınlama:** Kullanıcılar "Tekrar Yayınla" butonuna tıklayarak ilanlarını yeniden yayınlayabilir

## API Endpoints

### Cron Job Endpoint
- **URL:** `/api/cron/expire-listings`
- **Method:** GET veya POST
- **Auth:** `?secret=YOUR_CRON_SECRET` query parameter veya `Authorization: Bearer YOUR_CRON_SECRET` header

### Tekrar Yayınlama Endpoint
- **URL:** `/api/listings/[id]/renew`
- **Method:** POST
- **Auth:** Session required
- **Limit:** İlan süresi dolduktan sonra 7 gün içinde tekrar yayınlanabilir

## Test Etme

Cron job'u manuel olarak test etmek için:

```bash
curl -X GET "https://alo17.tr/api/cron/expire-listings?secret=YOUR_CRON_SECRET"
```

veya

```bash
curl -X GET "https://alo17.tr/api/cron/expire-listings" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Güvenlik

- Cron job endpoint'i sadece doğru secret key ile çalışır
- Secret key'i asla public repository'de saklamayın
- Production'da güçlü bir secret key kullanın

## Sorun Giderme

### Cron job çalışmıyor
1. Vercel Dashboard'da cron job'ların aktif olduğunu kontrol edin
2. Environment variable'ın doğru ayarlandığını kontrol edin
3. Logları kontrol edin: Vercel Dashboard > Functions > Logs

### İlanlar yayından kaldırılmıyor
1. Cron job'un çalıştığını kontrol edin
2. `expiresAt` tarihlerinin doğru olduğunu kontrol edin
3. Database'de `isActive` değerlerini kontrol edin

