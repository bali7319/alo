## Google ile Giriş (alo17.tr) – NextAuth

Bu projede Google login zaten kod tarafında hazır (`src/lib/auth.ts`). Google butonu, `/api/auth/providers` içinde `google` provider dönerse otomatik görünür (`src/app/giris/page.tsx`).

### Google Cloud Console ayarları
- **Authorized JavaScript origins**
  - `https://alo17.tr`
- **Authorized redirect URIs**
  - `https://alo17.tr/api/auth/callback/google`

### Sunucuda gerekli env değişkenleri
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL=https://alo17.tr`
- `NEXTAUTH_SECRET` (prod’da mutlaka set olmalı)

### SSH 2222 + key-only ile enable etme
PowerShell:

```powershell
cd C:\Users\bali\Desktop\alo
powershell -ExecutionPolicy Bypass -File .\scripts\google-oauth\ENABLE_GOOGLE_OAUTH.ps1 `
  -HostName "37.148.210.158" -Port 2222 -User "root" -IdentityFile "C:\Users\bali\20251973bscc20251973" `
  -GoogleClientId "<GOOGLE_CLIENT_ID>" -GoogleClientSecret "<GOOGLE_CLIENT_SECRET>"
```

Alternatif (önerilen): Google’ın indirdiğin `client_secret_*.json` dosyasını ver, ID/Secret otomatik okunsun:

```powershell
cd C:\Users\bali\Desktop\alo
powershell -ExecutionPolicy Bypass -File .\scripts\google-oauth\ENABLE_GOOGLE_OAUTH.ps1 `
  -HostName "37.148.210.158" -Port 2222 -User "root" -IdentityFile "C:\Users\bali\20251973bscc20251973" `
  -GoogleJsonPath "C:\Users\bali\Downloads\client_secret_....json" `
  -GoogleClientId "unused" -GoogleClientSecret "unused"
```

Kontrol:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\google-oauth\CHECK_GOOGLE_OAUTH.ps1 `
  -HostName "37.148.210.158" -Port 2222 -User "root" -IdentityFile "C:\Users\bali\20251973bscc20251973"
```

### Kritik not: outbound 443
Google OAuth callback sırasında sunucunun `googleapis.com` (HTTPS) ile token exchange yapması gerekir. Sunucudan **outbound 443** engellenmişse Google login hata verir. Bu durumda hosting sağlayıcıdan outbound 80/443 açmasını istemek gerekir.

