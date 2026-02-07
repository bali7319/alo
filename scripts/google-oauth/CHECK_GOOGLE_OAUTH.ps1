# Check Google OAuth status on alo17 (NextAuth)
#
# Usage:
#   cd C:\Users\bali\Desktop\alo
#   powershell -ExecutionPolicy Bypass -File .\scripts\google-oauth\CHECK_GOOGLE_OAUTH.ps1 `
#     -HostName "37.148.210.158" -Port 2222 -User "root" -IdentityFile "C:\Users\bali\20251973bscc20251973"
#

param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,

  [int]$Port = 2222,
  [string]$User = "root",
  [string]$IdentityFile = "",
  [string]$RemotePath = "/var/www/alo17"
)

# Ensure we pipe UTF-8 to ssh when sending bash scripts (Windows PowerShell defaults can break bash parsing)
try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
  $OutputEncoding = [Console]::OutputEncoding
} catch {}

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
  # Normalize line endings to LF to avoid $'...\r' issues on remote bash
  $normalized = $ScriptText -replace "`r`n", "`n"
  # Pass RemotePath as $1 to avoid any PowerShell interpolation issues
  $normalized | & ssh @args $dest "bash -s -- '$RemotePath'" 2>&1
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CHECK GOOGLE OAUTH (NextAuth)" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "RemotePath: $RemotePath" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "0) SSH connectivity..." -ForegroundColor Yellow
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) {
  Write-Host $ping
  throw "SSH connection failed"
}

Write-Host "`n1) .env vars present? (masked)" -ForegroundColor Yellow
Invoke-RemoteBash @'
set -e
cd "$1"
if [ -f .env ]; then
  for k in GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET NEXTAUTH_URL NEXTAUTH_SECRET; do
    v=$(grep -E "^$k=" .env | head -n1 | cut -d= -f2- || true)
    if [ -n "$v" ]; then
      echo "$k=SET"
    else
      echo "$k=MISSING"
    fi
  done
else
  echo ".env not found"
fi
'@

Write-Host "`n2) NextAuth providers endpoint (public)" -ForegroundColor Yellow
Write-Host "curl https://alo17.tr/api/auth/providers" -ForegroundColor Gray
Invoke-RemoteSsh "curl -sS -m 10 https://alo17.tr/api/auth/providers | head -200 || true"

Write-Host "`n3) Reminder (Google Cloud Console)" -ForegroundColor Yellow
Write-Host "- Authorized JS origin: https://alo17.tr" -ForegroundColor Cyan
Write-Host "- Redirect URI: https://alo17.tr/api/auth/callback/google" -ForegroundColor Cyan
Write-Host "- If Google button doesn't show: GOOGLE_CLIENT_ID/SECRET missing or NextAuth misconfigured." -ForegroundColor Gray
Write-Host "- If Google callback fails: check outbound 443 to googleapis.com (provider may still be blocking outbound)." -ForegroundColor Gray

