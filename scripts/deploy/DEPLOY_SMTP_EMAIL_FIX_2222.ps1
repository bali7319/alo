<#
Deploy SMTP/email related code to alo17 server (SSH 2222) and restart pm2.

Usage:
  cd C:\Users\bali\Desktop\alo
  powershell -ExecutionPolicy Bypass -File .\scripts\deploy\DEPLOY_SMTP_EMAIL_FIX_2222.ps1 `
    -HostName "alo17.tr" -User "root" -Port 2222 -IdentityFile "C:\Users\bali\20251973bscc20251973" `
    -RemotePath "/var/www/alo17"
#>

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

function Get-SshArgs {
  $args = @(
    "-p", "$Port",
    "-i", "$IdentityFile",
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=NUL",
    "-o", "LogLevel=ERROR",
    "-o", "BatchMode=yes",
    "-o", "ConnectTimeout=30",
    "-o", "ConnectionAttempts=3",
    "-o", "ServerAliveInterval=15",
    "-o", "ServerAliveCountMax=3"
  )
  return $args
}

function Invoke-RemoteSsh([string]$Command) {
  $sshArgs = Get-SshArgs
  & ssh.exe @sshArgs $dest $Command 2>&1
}

function Copy-File([string]$LocalPath, [string]$RemotePathFull) {
  if (-not (Test-Path -LiteralPath $LocalPath)) {
    throw "Missing local file: $LocalPath"
  }
  $remoteDir = ($RemotePathFull -replace '/[^/]+$','')
  if ($remoteDir -and $remoteDir.Trim().Length -gt 0) {
    Invoke-RemoteSsh "mkdir -p '$remoteDir'" | Out-Null
  }

  $scpArgs = @(
    "-P", "$Port",
    "-i", "$IdentityFile",
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=NUL",
    "-o", "LogLevel=ERROR",
    "-o", "BatchMode=yes",
    "-o", "ConnectTimeout=30",
    "-o", "ConnectionAttempts=3",
    "-o", "ServerAliveInterval=15",
    "-o", "ServerAliveCountMax=3"
  )

  $resolvedLocal = (Get-Item -LiteralPath $LocalPath).FullName
  $remoteSpec = "${dest}:$RemotePathFull"
  $out = & scp.exe @scpArgs "$resolvedLocal" "$remoteSpec" 2>&1
  if ($LASTEXITCODE -ne 0) {
    if ($out) { Write-Host $out }
    throw "SCP failed for $LocalPath (exit $LASTEXITCODE)"
  }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DEPLOY SMTP/EMAIL FIX (SSH 2222)" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "RemotePath: $RemotePath" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "0) SSH connectivity..." -ForegroundColor Yellow
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) { Write-Host $ping; throw "SSH connection failed" }

Write-Host "1) Copying files..." -ForegroundColor Yellow
$files = @(
  @{ local = ".\src\lib\email.ts"; remote = "$RemotePath/src/lib/email.ts" },
  @{ local = ".\src\app\api\test\smtp-check\route.ts"; remote = "$RemotePath/src/app/api/test/smtp-check/route.ts" },
  @{ local = ".\src\app\api\test\email\route.ts"; remote = "$RemotePath/src/app/api/test/email/route.ts" },
  @{ local = ".\src\app\api\listings\route.ts"; remote = "$RemotePath/src/app/api/listings/route.ts" },
  @{ local = ".\src\app\api\admin\listings\[id]\route.ts"; remote = "$RemotePath/src/app/api/admin/listings/[id]/route.ts" }
)

foreach ($f in $files) {
  Write-Host " - $($f.local) -> $($f.remote)" -ForegroundColor Gray
  Copy-File -LocalPath $f.local -RemotePathFull $f.remote | Out-Null
}

Write-Host "2) Rebuild + restart (pm2)..." -ForegroundColor Yellow
Invoke-RemoteSsh "cd '$RemotePath' && npm run build && pm2 restart alo17 --update-env && pm2 save" | ForEach-Object { $_ }

Write-Host ""
Write-Host "✅ Deploy completed." -ForegroundColor Green
Write-Host "Test SMTP: https://alo17.tr/api/test/smtp-check" -ForegroundColor Cyan
Write-Host "Test email: https://alo17.tr/admin/test-email" -ForegroundColor Cyan

