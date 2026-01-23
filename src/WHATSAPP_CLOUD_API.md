## WhatsApp (Meta Cloud API) ile “Yeni ilan onayda” bildirimi

Bu proje, **yeni ilan oluşturulup `approvalStatus: "pending"` olduğunda** admin’e WhatsApp mesajı gönderebilir.
Gönderim **template** üzerinden yapılır (Meta panelinde onaylanmış olmalı).

### Gerekli ENV değişkenleri

Uygulamanın çalıştığı sunucuda `.env` içine ekleyin:

- **`WHATSAPP_CLOUD_TOKEN`**: Meta Cloud API access token
- **`WHATSAPP_PHONE_NUMBER_ID`**: WhatsApp “Phone number ID”
- **`WHATSAPP_ADMIN_PHONE`**: Admin numarası **E.164** formatında, `+` olmadan (örn: `905414042404`)
- **`WHATSAPP_TEMPLATE_NEW_LISTING`** (opsiyonel): template adı (default: `yeni_ilan_bildirimi`)
- **`WHATSAPP_TEMPLATE_LANG`** (opsiyonel): dil kodu (default: `tr`)
- **`WHATSAPP_GRAPH_VERSION`** (opsiyonel): API versiyonu (default: `v19.0`)

### Template örneği (Meta paneli)

Template adı: `yeni_ilan_bildirimi`

Body örneği:

> Sayın Admin, alo17.tr üzerinde yeni bir ilan oluşturuldu.  
> İlan Başlığı: {{1}}

Kod tarafında `{{1}}` parametresi olarak ilan başlığı gönderilir.

### Kod entegrasyonu

- WhatsApp gönderimi: `src/lib/whatsapp.ts`
- Tetikleme yeri: `src/app/api/listings/route.ts` (POST → ilan oluşturma → `finalApprovalStatus === 'pending'`)

