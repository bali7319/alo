<#
Deploy E-Commerce admin panel files to alo17 server (SSH 2222).

This script uploads ONLY the e-commerce admin panel + API + lib files
and then rebuilds + restarts PM2.

Usage:
  cd C:\Users\bali\Desktop\alo
  powershell -ExecutionPolicy Bypass -File .\scripts\deploy\DEPLOY_ECOMMERCE_PANEL_2222.ps1 `
    -HostName "alo17.tr" -User "root" -Port 2222 -IdentityFile "C:\Users\bali\20251973bscc20251973" `
    -RemotePath "/var/www/alo17" -Pm2AppName "alo17"
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,
  [string]$User = "root",
  [int]$Port = 2222,
  [Parameter(Mandatory = $true)]
  [string]$IdentityFile,
  [string]$RemotePath = "/var/www/alo17",
  [string]$Pm2AppName = "alo17"
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

function Put-File([string]$LocalPath, [string]$RemotePathFull) {
  $remoteDir = ($RemotePathFull -replace '/[^/]+$','')
  Invoke-RemoteSsh "mkdir -p '$remoteDir'" | Out-Null

  $resolvedLocal = $LocalPath
  try { $resolvedLocal = (Get-Item -LiteralPath $LocalPath -ErrorAction Stop).FullName } catch {}

  $maxAttempts = 3
  for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    $batch = @"
put "$resolvedLocal" "$RemotePathFull"
"@

    $out = $batch | & sftp.exe -P $Port -i $IdentityFile `
      -o StrictHostKeyChecking=no `
      -o UserKnownHostsFile=NUL `
      -o BatchMode=yes `
      -o ConnectTimeout=30 `
      -o ConnectionAttempts=3 `
      -o ServerAliveInterval=15 `
      -o ServerAliveCountMax=3 `
      -b - $dest 2>&1

    if ($LASTEXITCODE -eq 0) { return }

    Write-Host $out
    if ($attempt -lt $maxAttempts) {
      Write-Host "Retry ($attempt/$maxAttempts) for $LocalPath ..." -ForegroundColor Yellow
      Start-Sleep -Seconds (3 * $attempt)
    }
  }

  throw "SFTP failed for $LocalPath"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DEPLOY E-COMMERCE PANEL (SSH 2222)" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "RemotePath: $RemotePath  PM2: $Pm2AppName" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "0) SSH connectivity..." -ForegroundColor Yellow
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) { Write-Host $ping; throw "SSH connection failed" }

Write-Host "1) Uploading files..." -ForegroundColor Yellow

$files = @(
  # Admin menu
  @{ local = ".\\src\\app\\admin\\layout.tsx"; remote = "$RemotePath/src/app/admin/layout.tsx" },

  # E-commerce admin pages
  @{ local = ".\\src\\app\\admin\\eticaret\\entegrasyonlar\\page.tsx"; remote = "$RemotePath/src/app/admin/eticaret/entegrasyonlar/page.tsx" },
  @{ local = ".\\src\\app\\admin\\eticaret\\urunler\\page.tsx"; remote = "$RemotePath/src/app/admin/eticaret/urunler/page.tsx" },
  @{ local = ".\\src\\app\\admin\\eticaret\\siparisler\\page.tsx"; remote = "$RemotePath/src/app/admin/eticaret/siparisler/page.tsx" },

  # Admin API routes
  @{ local = ".\\src\\app\\api\\admin\\marketplaces\\connections\\route.ts"; remote = "$RemotePath/src/app/api/admin/marketplaces/connections/route.ts" },
  @{ local = ".\\src\\app\\api\\admin\\marketplaces\\connections\\[id]\\route.ts"; remote = "$RemotePath/src/app/api/admin/marketplaces/connections/[id]/route.ts" },
  @{ local = ".\\src\\app\\api\\admin\\marketplaces\\connections\\[id]\\test\\route.ts"; remote = "$RemotePath/src/app/api/admin/marketplaces/connections/[id]/test/route.ts" },
  @{ local = ".\\src\\app\\api\\admin\\marketplaces\\products\\route.ts"; remote = "$RemotePath/src/app/api/admin/marketplaces/products/route.ts" },
  @{ local = ".\\src\\app\\api\\admin\\marketplaces\\orders\\route.ts"; remote = "$RemotePath/src/app/api/admin/marketplaces/orders/route.ts" },

  # Marketplace libs
  @{ local = ".\\src\\lib\\marketplaces\\credentials.ts"; remote = "$RemotePath/src/lib/marketplaces/credentials.ts" },
  @{ local = ".\\src\\lib\\marketplaces\\types.ts"; remote = "$RemotePath/src/lib/marketplaces/types.ts" },
  @{ local = ".\\src\\lib\\marketplaces\\adapters.ts"; remote = "$RemotePath/src/lib/marketplaces/adapters.ts" },
  @{ local = ".\\src\\lib\\marketplaces\\storage.ts"; remote = "$RemotePath/src/lib/marketplaces/storage.ts" }
)

foreach ($f in $files) {
  if (-not (Test-Path -LiteralPath $f.local)) {
    Write-Host " ! missing local file: $($f.local)" -ForegroundColor Red
    throw "Missing local file: $($f.local)"
  }
  Write-Host " - $($f.local) -> $($f.remote)" -ForegroundColor Gray
  Put-File -LocalPath $f.local -RemotePathFull $f.remote | Out-Null
}

Write-Host "2) Rebuild + restart (pm2)..." -ForegroundColor Yellow
$cmd = "set -e; cd '$RemotePath'; npx prisma generate; npm run build; pm2 restart '$Pm2AppName'; pm2 save; echo '✅ Done.'"
Invoke-RemoteSsh $cmd | ForEach-Object { $_ }

Write-Host ""
Write-Host "✅ Deploy completed." -ForegroundColor Green
Write-Host "Test: https://alo17.tr/admin" -ForegroundColor Cyan

