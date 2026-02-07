# Alo17 Sync Agent (Windows)

Sunucu `hemenalgetir.com` gibi bir store'a erişemiyorsa (443 timeout / firewall), WooCommerce senkronunu bu masaüstü uygulaması yapar:

- Panelden **Bearer token** ile Woo entegrasyon bilgilerini alır
- WooCommerce REST API'dan **ürün + sipariş** çeker
- Sonuçları panele **ingest** ederek kaydeder (`.data/marketplaces/data.json`)

## 1) Panel (sunucu) ayarı

Sunucuda `.env` içine şunu ekleyin ve deploy edin:

- `MARKETPLACE_AGENT_TOKEN`: uzun, tahmin edilemez bir token

Bu token ile aşağıdaki endpointler açılır:

- `GET /api/admin/marketplaces/agent/config/:provider`
- `POST /api/admin/marketplaces/agent/ingest/:provider`

## 2) Agent'ı çalıştırma (Windows)

Bu klasörde:

```bash
npm install
npm run dev
```

Uygulama açılınca:

- **Panel URL**: örn `https://alo17.tr`
- **Agent Token**: sunucudaki `MARKETPLACE_AGENT_TOKEN`
- **Config Al**: bağlantı/credential doğrulama
- **Senkronla**: ürün + sipariş çekip panele yazma

## Build (kurulum dosyası)

```bash
npm run dist
```

Çıktı: `desktop-sync-agent/release/` altında NSIS installer.

