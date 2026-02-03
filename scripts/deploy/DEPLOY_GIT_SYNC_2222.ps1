<#
Deploy via git sync (SSH 2222).

This method is SAFE for large refactors because it applies deletions too
(`git reset --hard` + `git clean -fd`), unlike file-copy deployments.

Usage:
  cd C:\Users\bali\Desktop\alo
  powershell -ExecutionPolicy Bypass -File .\scripts\deploy\DEPLOY_GIT_SYNC_2222.ps1 `
    -HostName "37.148.210.158" -User "root" -Port 2222 -IdentityFile "C:\Users\bali\KEYFILE" `
    -RemotePath "/var/www/alo17"
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,
  [string]$User = "root",
  [int]$Port = 2222,
  [Parameter(Mandatory = $true)]
  [string]$IdentityFile,
  [string]$RemotePath = "/var/www/alo17",
  [string]$Branch = "main",
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

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DEPLOY (GIT SYNC) (SSH 2222)" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "RemotePath: $RemotePath  Branch: $Branch  PM2: $Pm2AppName" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "0) SSH connectivity..." -ForegroundColor Yellow
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) { Write-Host $ping; throw "SSH connection failed" }

Write-Host "1) Git sync + install + build + restart..." -ForegroundColor Yellow
$remoteCmd = "set -euo pipefail; " +
  "cd '$RemotePath'; " +
  "echo '📥 Git sync...'; " +
  "git fetch origin '$Branch'; " +
  "git reset --hard 'origin/$Branch'; " +
  "git clean -fd; " +
  "echo '📦 NPM install (deterministic)...'; " +
  "if [ -f package-lock.json ]; then npm ci --production=false; else npm install --include=dev; fi; " +
  "echo '🔧 Prisma generate...'; " +
  "npx prisma generate; " +
  "echo '🏗️ Build...'; " +
  "npm run build; " +
  "echo '🔄 PM2 restart...'; " +
  "pm2 restart '$Pm2AppName'; pm2 save; " +
  "echo '✅ Deploy completed.'"

Invoke-RemoteSsh $remoteCmd | ForEach-Object { $_ }

Write-Host ""
Write-Host "✅ Done." -ForegroundColor Green

