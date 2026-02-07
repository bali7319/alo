# E-ticaret kaldırıldıktan sonra: Prisma client güncelle ve (opsiyonel) migration uygula
# Proje kökünden çalıştır: .\scripts\prisma-remove-ecommerce.ps1
#
# Not: prisma@6 kullanilir (proje 6.x; npx prisma 7 cekebilir ve schema uyumsuz olur).
# Migration PostgreSQL icindir (sunucuda migrate deploy calistirin).

$ErrorActionPreference = "Stop"
# Proje kökü: script scripts\ veya scripts\deploy\ altındaysa bir üst dizinlerde package.json ara
$root = Split-Path -Parent $PSScriptRoot
while ($root -and -not (Test-Path (Join-Path $root "package.json"))) { $root = Split-Path -Parent $root }
if (-not $root -or -not (Test-Path (Join-Path $root "package.json"))) { Write-Error "Proje kökü (package.json) bulunamadı. Alo klasöründen calistirin." }
Set-Location $root

Write-Host "1. Prisma client uretiliyor (prisma generate)..." -ForegroundColor Cyan
# Proje Prisma 6 kullaniyor; Prisma 7 ile uyumsuzluk olmasin diye 6.x zorla
& npm exec -- prisma@6 -- generate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Migration sadece PostgreSQL ile calisir; DATABASE_URL postgresql:// veya postgres:// ile baslamali
$envPath = Join-Path $root ".env"
$dbUrl = ""
if (Test-Path $envPath) {
  Get-Content $envPath | ForEach-Object {
    if ($_ -match '^\s*DATABASE_URL\s*=\s*(.+)$') {
      $dbUrl = $matches[1].Trim().Trim('"').Trim("'")
    }
  }
}
$isPostgres = $dbUrl -and ($dbUrl.StartsWith("postgresql://", "OrdinalIgnoreCase") -or $dbUrl.StartsWith("postgres://", "OrdinalIgnoreCase"))

if (-not $isPostgres) {
  Write-Host "2. Migration atlandi: DATABASE_URL PostgreSQL degil veya tanimli degil." -ForegroundColor Yellow
  Write-Host "   Bu migration sadece PostgreSQL icindir. Sunucuda (PostgreSQL URL ile) calistirin:" -ForegroundColor Gray
  Write-Host "   npm exec -- prisma@6 -- migrate deploy" -ForegroundColor Gray
  exit 0
}

Write-Host "2. Migration uygulamak icin (PostgreSQL tespit edildi): npm exec -- prisma@6 -- migrate deploy" -ForegroundColor Yellow
$apply = Read-Host "Migration su an uygulansin mi? (y/N)"
if ($apply -eq "y" -or $apply -eq "Y") {
  & npm exec -- prisma@6 -- migrate deploy
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "Migration tamamlandi." -ForegroundColor Green
} else {
  Write-Host "Atlandi. Istediginiz zaman: npm exec -- prisma@6 -- migrate deploy" -ForegroundColor Gray
}
