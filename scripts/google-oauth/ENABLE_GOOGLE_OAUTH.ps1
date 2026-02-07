# Enable Google OAuth on alo17 (NextAuth)
# Works with SSH on port 2222 + key-only.
#
# Usage (PowerShell):
#   cd C:\Users\bali\Desktop\alo
#   powershell -ExecutionPolicy Bypass -File .\scripts\google-oauth\ENABLE_GOOGLE_OAUTH.ps1 `
#     -HostName "37.148.210.158" -Port 2222 -User "root" -IdentityFile "C:\Users\bali\20251973bscc20251973" `
#     -GoogleClientId "..." -GoogleClientSecret "..."
#

param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,

  [int]$Port = 2222,
  [string]$User = "root",
  [string]$IdentityFile = "",
  [string]$RemotePath = "/var/www/alo17",

  # Optional: Provide Google OAuth JSON file (downloaded from Google Cloud Console).
  # If set, -GoogleClientId / -GoogleClientSecret are auto-loaded from this JSON.
  [string]$GoogleJsonPath = "",

  [Parameter(Mandatory = $true)]
  [string]$GoogleClientId,

  [Parameter(Mandatory = $true)]
  [string]$GoogleClientSecret,

  [string]$NextAuthUrl = "https://alo17.tr",
  [string]$NextAuthSecret = ""
)

function Invoke-RemoteSsh {
  param([string]$Command)
  $dest = "$User@$HostName"
  $args = @("-p", "$Port", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15")
  if (-not [string]::IsNullOrWhiteSpace($IdentityFile)) {
    $args += @("-i", $IdentityFile)
  }
  & ssh @args $dest $Command 2>&1
}

function Invoke-RemoteBash {
  param([string]$ScriptText)
  $dest = "$User@$HostName"
  $args = @("-p", "$Port", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15")
  if (-not [string]::IsNullOrWhiteSpace($IdentityFile)) {
    $args += @("-i", $IdentityFile)
  }
  # Normalize line endings to LF
  $normalized = $ScriptText -replace "`r`n", "`n"
  $normalized | & ssh @args $dest "bash -s" 2>&1
}

function Load-GoogleCredsFromJson {
  param([string]$Path)
  if ([string]::IsNullOrWhiteSpace($Path)) { return $null }
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "GoogleJsonPath not found: $Path"
  }
  $json = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
  # Google OAuth client JSON can be { web: { client_id, client_secret } } or { installed: { ... } }
  $node = $null
  if ($json.web) { $node = $json.web }
  elseif ($json.installed) { $node = $json.installed }
  else { throw "Unrecognized Google OAuth JSON format (expected 'web' or 'installed')." }

  if (-not $node.client_id -or -not $node.client_secret) {
    throw "Google OAuth JSON missing client_id/client_secret."
  }
  return @{
    client_id = [string]$node.client_id
    client_secret = [string]$node.client_secret
  }
}

function Mask([string]$value, [int]$prefix = 10) {
  if ([string]::IsNullOrWhiteSpace($value)) { return "" }
  if ($value.Length -le $prefix) { return $value }
  return ($value.Substring(0, $prefix) + "…")
}

if (-not [string]::IsNullOrWhiteSpace($GoogleJsonPath)) {
  $creds = Load-GoogleCredsFromJson -Path $GoogleJsonPath
  $GoogleClientId = $creds.client_id
  $GoogleClientSecret = $creds.client_secret
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ENABLE GOOGLE OAUTH (NextAuth)" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "RemotePath: $RemotePath" -ForegroundColor Gray
Write-Host "GOOGLE_CLIENT_ID: $(Mask $GoogleClientId 20)" -ForegroundColor Gray
Write-Host "GOOGLE_CLIENT_SECRET: $(Mask $GoogleClientSecret 8)" -ForegroundColor Gray
Write-Host "NEXTAUTH_URL: $NextAuthUrl" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "0) SSH connectivity..." -ForegroundColor Yellow
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) {
  Write-Host $ping
  throw "SSH connection failed"
}

Write-Host "1) Backup .env ..." -ForegroundColor Yellow
# IMPORTANT: Escape $(...) so PowerShell doesn't treat it as a subexpression (Get-Date).
Invoke-RemoteSsh "cd $RemotePath && test -f .env && cp .env .env.backup.`$(date +%Y%m%d_%H%M%S) || true" | Out-Null

Write-Host "2) Writing env vars ..." -ForegroundColor Yellow
$escapedClientId = $GoogleClientId.Replace("'", "'\''")
$escapedClientSecret = $GoogleClientSecret.Replace("'", "'\''")
$escapedNextAuthUrl = $NextAuthUrl.Replace("'", "'\''")

# NEXTAUTH_SECRET optional: only set if provided
$setSecretLine = ""
if (-not [string]::IsNullOrWhiteSpace($NextAuthSecret)) {
  $escapedSecret = $NextAuthSecret.Replace("'", "'\''")
  $setSecretLine = @"
if grep -q '^NEXTAUTH_SECRET=' .env; then
  sed -i 's|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$escapedSecret|' .env
else
  echo 'NEXTAUTH_SECRET=$escapedSecret' >> .env
fi
"@
}

$remoteScript = @"
set -e
cd '$RemotePath'
touch .env

if grep -q '^GOOGLE_CLIENT_ID=' .env; then
  sed -i 's|^GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=$escapedClientId|' .env
else
  echo 'GOOGLE_CLIENT_ID=$escapedClientId' >> .env
fi

if grep -q '^GOOGLE_CLIENT_SECRET=' .env; then
  sed -i 's|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$escapedClientSecret|' .env
else
  echo 'GOOGLE_CLIENT_SECRET=$escapedClientSecret' >> .env
fi

if grep -q '^NEXTAUTH_URL=' .env; then
  sed -i 's|^NEXTAUTH_URL=.*|NEXTAUTH_URL=$escapedNextAuthUrl|' .env
else
  echo 'NEXTAUTH_URL=$escapedNextAuthUrl' >> .env
fi

$setSecretLine

echo 'done'
"@

Invoke-RemoteBash $remoteScript | Out-Null

Write-Host "3) Restarting app (pm2) ..." -ForegroundColor Yellow
Invoke-RemoteSsh "cd $RemotePath && pm2 restart alo17 && pm2 save" | Out-Null

Write-Host ""
Write-Host "✅ Google OAuth env vars set + PM2 restarted." -ForegroundColor Green
Write-Host ""
Write-Host "Google Cloud Console settings (must):" -ForegroundColor Yellow
Write-Host "- Authorized JavaScript origins:" -ForegroundColor White
Write-Host "  https://alo17.tr" -ForegroundColor Cyan
Write-Host "- Authorized redirect URIs:" -ForegroundColor White
Write-Host "  https://alo17.tr/api/auth/callback/google" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test:" -ForegroundColor Yellow
Write-Host "- https://alo17.tr/api/auth/providers" -ForegroundColor Cyan
Write-Host "- https://alo17.tr/giris (Google ile Giriş Yap butonu görünmeli)" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️ Not: Sunucudan outbound 443 (googleapis.com) kapalıysa Google callback token exchange çalışmayabilir." -ForegroundColor Yellow

