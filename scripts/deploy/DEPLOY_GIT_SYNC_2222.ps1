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
    -o LogLevel=ERROR `
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
  # Avoid PowerShell "NativeCommandError" noise by merging remote stderr->stdout.
  "exec 2>&1; " +
  "echo 'Preflight...'; " +
  "node -v; npm -v; " +
  "echo 'Exec check (repo mount)...'; " +
  "printf '%s\n' '#!/bin/sh' 'echo exec-ok' > .alo17_exec_test.sh; chmod +x .alo17_exec_test.sh; " +
  "if ./.alo17_exec_test.sh; then :; else echo 'exec-failed (likely noexec mount)'; fi; rm -f .alo17_exec_test.sh; " +
  "echo 'Git sync...'; " +
  "git fetch origin '$Branch'; " +
  "git reset --hard 'origin/$Branch'; " +
  # IMPORTANT:
  # - We MUST wipe ignored build artifacts (node_modules, .next, etc.) to avoid npm ENOTEMPTY issues.
  # - We MUST keep user-uploaded assets + env files safe.
  # NOTE: `-x` removes ignored files too; exclusions keep the important ones.
  "git clean -fdx " +
    "-e public/uploads " +
    "-e public/images/listings " +
    "-e .env " +
    "-e .env.* " +
    "-e prisma/dev.db " +
    "-e prisma/prisma/dev.db; " +
  "echo 'NPM install (deterministic)...'; " +
  # NOTE: On some servers /var/www may be mounted with `noexec`, which breaks postinstall binaries.
  # Using --ignore-scripts avoids failures like "napi-postinstall: Permission denied".
  "if [ -f package-lock.json ]; then npm ci --production=false --ignore-scripts; else npm install --include=dev --ignore-scripts; fi; " +
  "echo 'Prisma generate...'; " +
  "node node_modules/prisma/build/index.js generate; " +
  "echo 'Prisma migrate deploy...'; " +
  "node node_modules/prisma/build/index.js migrate deploy; " +
  "echo 'Sanity check (Next export module)...'; " +
  "if [ -f node_modules/next/dist/export/index.js ]; then " +
    "echo 'node_modules/next/dist/export/index.js OK'; " +
  "else " +
    "echo 'node_modules/next/dist/export/index.js MISSING'; " +
    "echo 'Next install seems incomplete; reinstalling next...'; " +
    "rm -rf node_modules/next; " +
    "npm install --no-save next@15.5.9 --ignore-scripts; " +
    "test -f node_modules/next/dist/export/index.js; " +
  "fi; " +
  "echo 'Build...'; " +
  "node node_modules/next/dist/bin/next build; " +
  "echo 'PM2 restart...'; " +
  "pm2 restart '$Pm2AppName'; pm2 save; " +
  "echo 'Deploy completed.'"

Invoke-RemoteSsh $remoteCmd | ForEach-Object { $_ }
if ($LASTEXITCODE -ne 0) { throw "Remote deploy command failed (exit $LASTEXITCODE)" }

Write-Host ""
Write-Host "✅ Done." -ForegroundColor Green

