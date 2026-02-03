# Deploy homepage UI changes to alo17 server (SSH 2222 + key)
#
# Copies only the changed files and rebuilds + restarts PM2.
#
# Usage:
#   cd C:\Users\bali\Desktop\alo
#   powershell -ExecutionPolicy Bypass -File .\scripts\deploy\DEPLOY_HOME_UI_2222.ps1 `
#     -HostName "37.148.210.158" -User "root" -Port 2222 -IdentityFile "C:\Users\bali\20251973bscc20251973" `
#     -RemotePath "/var/www/alo17"
#

param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,
  [string]$User = "root",
  [int]$Port = 2222,
  [Parameter(Mandatory = $true)]
  [string]$IdentityFile,
  [string]$RemotePath = "/var/www/alo17"
)

try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
  $OutputEncoding = [Console]::OutputEncoding
} catch {}

$dest = "$User@$HostName"

function Invoke-RemoteSsh([string]$Command) {
  & ssh.exe -p $Port -i $IdentityFile `
    -o StrictHostKeyChecking=no `
    -o UserKnownHostsFile=NUL `
    -o BatchMode=yes `
    -o ConnectTimeout=30 `
    -o ConnectionAttempts=3 `
    -o ServerAliveInterval=15 `
    -o ServerAliveCountMax=3 `
    $dest $Command 2>&1
}

function ScpFile([string]$LocalPath, [string]$RemotePathFull) {
  # Ensure remote dir exists
  $remoteDir = ($RemotePathFull -replace '/[^/]+$','')
  Invoke-RemoteSsh "mkdir -p '$remoteDir'" | Out-Null

  # Resolve local path as literal (avoid wildcard issues with [id] folders on Windows)
  $resolvedLocal = $LocalPath
  try {
    $resolvedLocal = (Get-Item -LiteralPath $LocalPath -ErrorAction Stop).FullName
  } catch {
    # fallback to provided path; caller will handle missing file
    $resolvedLocal = $LocalPath
  }

  $maxAttempts = 3
  for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    # Use SFTP in batch mode to avoid remote-shell globbing issues with paths like [id]
    $batch = @"
put "$resolvedLocal" "$RemotePathFull"
"@

    $scpOut = $batch | & sftp.exe -P $Port -i $IdentityFile `
      -o StrictHostKeyChecking=no `
      -o UserKnownHostsFile=NUL `
      -o BatchMode=yes `
      -o ConnectTimeout=30 `
      -o ConnectionAttempts=3 `
      -o ServerAliveInterval=15 `
      -o ServerAliveCountMax=3 `
      -b - $dest 2>&1

    if ($LASTEXITCODE -eq 0) {
      return
    }

    Write-Host $scpOut
    if ($attempt -lt $maxAttempts) {
      Write-Host "SCP retry ($attempt/$maxAttempts) for $LocalPath ..." -ForegroundColor Yellow
      Start-Sleep -Seconds (3 * $attempt)
    }
  }

  throw "SCP failed for $LocalPath"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DEPLOY HOME UI (SSH 2222)" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "RemotePath: $RemotePath" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# IMPORTANT:
# This script copies a fixed list of files. It does NOT delete removed files on the server.
# For large refactors (like route deletions), prefer the git-sync deploy:
#   .\scripts\deploy\DEPLOY_GIT_SYNC_2222.ps1
Write-Host "NOTE: For big refactors, prefer DEPLOY_GIT_SYNC_2222.ps1 (applies deletions)." -ForegroundColor Yellow
Write-Host ""

Write-Host "0) SSH connectivity..." -ForegroundColor Yellow
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) { Write-Host $ping; throw "SSH connection failed" }

Write-Host "1) Copying files..." -ForegroundColor Yellow

$files = @(
  # Social media assets
  @{ local = ".\\public\\social\\facebook-story-alo17.svg"; remote = "$RemotePath/public/social/facebook-story-alo17.svg" },
  @{ local = ".\\public\\social\\facebook-feed-alo17.svg"; remote = "$RemotePath/public/social/facebook-feed-alo17.svg" },

  # Next config (deployment-sensitive)
  @{ local = ".\\next.config.js"; remote = "$RemotePath/next.config.js" },
  @{ local = ".\\src\\next.config.mjs"; remote = "$RemotePath/src/next.config.mjs" },

  # SEO helpers / tracking
  @{ local = ".\\src\\components\\seo\\AutoLinkText.tsx"; remote = "$RemotePath/src/components/seo/AutoLinkText.tsx" },
  @{ local = ".\\src\\lib\\slug.ts"; remote = "$RemotePath/src/lib/slug.ts" },
  @{ local = ".\\src\\lib\\email.ts"; remote = "$RemotePath/src/lib/email.ts" },
  @{ local = ".\\src\\app\\api\\track\\link\\route.ts"; remote = "$RemotePath/src/app/api/track/link/route.ts" },
  @{ local = ".\\src\\app\\api\\admin\\seo-settings\\route.ts"; remote = "$RemotePath/src/app/api/admin/seo-settings/route.ts" },
  @{ local = ".\\src\\app\\api\\admin\\seo-report\\route.ts"; remote = "$RemotePath/src/app/api/admin/seo-report/route.ts" },
  @{ local = ".\\src\\lib\\seo-settings.ts"; remote = "$RemotePath/src/lib/seo-settings.ts" },
  @{ local = ".\\src\\app\\ilan\\[id]\\page.tsx"; remote = "$RemotePath/src/app/ilan/[id]/page.tsx" },
  @{ local = ".\\src\\components\\listing-card.tsx"; remote = "$RemotePath/src/components/listing-card.tsx" },
  @{ local = ".\\src\\components\\featured-ads.tsx"; remote = "$RemotePath/src/components/featured-ads.tsx" },
  @{ local = ".\\src\\components\\latest-ads.tsx"; remote = "$RemotePath/src/components/latest-ads.tsx" },
  @{ local = ".\\src\\app\\admin\\sikayetler\\page.tsx"; remote = "$RemotePath/src/app/admin/sikayetler/page.tsx" },
  @{ local = ".\\src\\app\\admin\\ayarlar\\page.tsx"; remote = "$RemotePath/src/app/admin/ayarlar/page.tsx" },
  @{ local = ".\\src\\app\\admin\\seo-rapor\\page.tsx"; remote = "$RemotePath/src/app/admin/seo-rapor/page.tsx" },
  @{ local = ".\\src\\app\\sitemap.ts"; remote = "$RemotePath/src/app/sitemap.ts" },
  @{ local = ".\\src\\app\\ilanlar\\page.tsx"; remote = "$RemotePath/src/app/ilanlar/page.tsx" },
  @{ local = ".\\src\\app\\ilanlar\\IlanlarClient.tsx"; remote = "$RemotePath/src/app/ilanlar/IlanlarClient.tsx" },
  @{ local = ".\\src\\app\\ilan-ver\\duzenle\\[id]\\page.tsx"; remote = "$RemotePath/src/app/ilan-ver/duzenle/[id]/page.tsx" },

  @{ local = ".\src\middleware.ts"; remote = "$RemotePath/src/middleware.ts" },
  @{ local = ".\src\app\page.tsx"; remote = "$RemotePath/src/app/page.tsx" },
  @{ local = ".\src\app\not-found.tsx"; remote = "$RemotePath/src/app/not-found.tsx" },
  @{ local = ".\src\app\giris\page.tsx"; remote = "$RemotePath/src/app/giris/page.tsx" },
  @{ local = ".\src\app\favorilerim\page.tsx"; remote = "$RemotePath/src/app/favorilerim/page.tsx" },
  @{ local = ".\src\app\ilanlarim\page.tsx"; remote = "$RemotePath/src/app/ilanlarim/page.tsx" },
  @{ local = ".\src\app\moderator\page.tsx"; remote = "$RemotePath/src/app/moderator/page.tsx" },
  @{ local = ".\src\app\profil\page.tsx"; remote = "$RemotePath/src/app/profil/page.tsx" },
  @{ local = ".\src\app\profil\duzenle\page.tsx"; remote = "$RemotePath/src/app/profil/duzenle/page.tsx" },
  @{ local = ".\src\app\dev\ilan-detay\ui.tsx"; remote = "$RemotePath/src/app/dev/ilan-detay/ui.tsx" },
  @{ local = ".\src\app\api\auth\forgot-password\route.ts"; remote = "$RemotePath/src/app/api/auth/forgot-password/route.ts" },
  @{ local = ".\src\app\api\auth\reset-password\route.ts"; remote = "$RemotePath/src/app/api/auth/reset-password/route.ts" },
  @{ local = ".\prisma\schema.prisma"; remote = "$RemotePath/prisma/schema.prisma" },
  @{ local = ".\src\lib\auth.ts"; remote = "$RemotePath/src/lib/auth.ts" },
  @{ local = ".\src\app\admin\uyeler\page.tsx"; remote = "$RemotePath/src/app/admin/uyeler/page.tsx" },
  @{ local = ".\src\app\admin\error.tsx"; remote = "$RemotePath/src/app/admin/error.tsx" },
  @{ local = ".\src\app\admin\ilanlar\page.tsx"; remote = "$RemotePath/src/app/admin/ilanlar/page.tsx" },
  @{ local = ".\src\app\admin\ai-sablon\page.tsx"; remote = "$RemotePath/src/app/admin/ai-sablon/page.tsx" },
  @{ local = ".\src\app\api\admin\users\[id]\route.ts"; remote = "$RemotePath/src/app/api/admin/users/[id]/route.ts" },
  @{ local = ".\src\app\ilan\[id]\IlanDetayClient.tsx"; remote = "$RemotePath/src/app/ilan/[id]/IlanDetayClient.tsx" },
  @{ local = ".\src\app\globals.css"; remote = "$RemotePath/src/app/globals.css" },
  @{ local = ".\src\app\kullanim-kosullari\page.tsx"; remote = "$RemotePath/src/app/kullanim-kosullari/page.tsx" },
  @{ local = ".\src\app\kullanim-sartlari\page.tsx"; remote = "$RemotePath/src/app/kullanim-sartlari/page.tsx" },
  @{ local = ".\src\app\hakkimizda\page.tsx"; remote = "$RemotePath/src/app/hakkimizda/page.tsx" },
  @{ local = ".\src\app\kategoriler\page.tsx"; remote = "$RemotePath/src/app/kategoriler/page.tsx" },
  @{ local = ".\src\app\kategoriler\KategorilerClient.tsx"; remote = "$RemotePath/src/app/kategoriler/KategorilerClient.tsx" },
  @{ local = ".\src\app\ilan-verme-kurallari\page.tsx"; remote = "$RemotePath/src/app/ilan-verme-kurallari/page.tsx" },

  # Premium ödeme/onay akışı düzeltmeleri
  @{ local = ".\src\app\api\listings\route.ts"; remote = "$RemotePath/src/app/api/listings/route.ts" },
  @{ local = ".\src\app\api\listings\[id]\route.ts"; remote = "$RemotePath/src/app/api/listings/[id]/route.ts" },
  @{ local = ".\src\app\ilan-ver\onizle\[id]\IlanOnizleClient.tsx"; remote = "$RemotePath/src/app/ilan-ver/onizle/[id]/IlanOnizleClient.tsx" },

  @{ local = ".\src\components\home\WhyUsHero.tsx"; remote = "$RemotePath/src/components/home/WhyUsHero.tsx" },
  @{ local = ".\src\components\home\AdvantageBand.tsx"; remote = "$RemotePath/src/components/home/AdvantageBand.tsx" },
  @{ local = ".\src\components\home\DifferenceSidebar.tsx"; remote = "$RemotePath/src/components/home/DifferenceSidebar.tsx" },
  @{ local = ".\src\components\home\CityStory.tsx"; remote = "$RemotePath/src/components/home/CityStory.tsx" },
  @{ local = ".\src\components\footer.tsx"; remote = "$RemotePath/src/components/footer.tsx" },
  @{ local = ".\src\components\Header.tsx"; remote = "$RemotePath/src/components/Header.tsx" },
  @{ local = ".\src\components\home-page-content.tsx"; remote = "$RemotePath/src/components/home-page-content.tsx" },
  @{ local = ".\src\components\ilanlarim-button.tsx"; remote = "$RemotePath/src/components/ilanlarim-button.tsx" },
  @{ local = ".\src\lib\prisma.ts"; remote = "$RemotePath/src/lib/prisma.ts" }
)

foreach ($f in $files) {
  # Use -LiteralPath to avoid wildcard interpretation of paths like [id]
  if (-not (Test-Path -LiteralPath $f.local)) {
    Write-Host " ! skipping missing local file: $($f.local)" -ForegroundColor Yellow
    continue
  }
  Write-Host " - $($f.local) -> $($f.remote)" -ForegroundColor Gray
  ScpFile -LocalPath $f.local -RemotePathFull $f.remote | Out-Null
}

Write-Host "2) Rebuild + restart (pm2)..." -ForegroundColor Yellow
Invoke-RemoteSsh "cd '$RemotePath' && npm run build && pm2 restart alo17 && pm2 save" | ForEach-Object { $_ }

Write-Host ""
Write-Host "✅ Deploy completed." -ForegroundColor Green
Write-Host "Test: https://alo17.tr" -ForegroundColor Cyan

