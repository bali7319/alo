# Setup SMTP env vars on alo17 server (SSH 2222) and restart pm2.
#
# This script uploads a temporary env snippet to the server, merges it into
# `$RemotePath/.env` (creates if missing), then rebuilds and restarts.
#
# Usage examples:
#   powershell -ExecutionPolicy Bypass -File .\scripts\deploy\SETUP_SMTP_2222.ps1
#
#   powershell -ExecutionPolicy Bypass -File .\scripts\deploy\SETUP_SMTP_2222.ps1 `
#     -HostName "alo17.tr" -User "root" -Port 2222 -IdentityFile "C:\path\to\key"

param(
  [string]$HostName = "alo17.tr",
  [string]$User = "root",
  [int]$Port = 2222,
  [string]$IdentityFile = "",
  [string]$RemotePath = "/var/www/alo17",
  [string]$EnvFileName = ".env",

  [string]$SiteUrl = "https://alo17.tr",

  [string]$SmtpHost = "mail.kurumsaleposta.com",
  [string]$SmtpPort = "587",
  [string]$SmtpUser = "destek@alo17.tr",
  [string]$SmtpPass = "",
  [string]$SmtpFrom = "destek@alo17.tr",
  [string]$AdminEmail = "destek@alo17.tr",
  [string]$SupportEmail = "destek@alo17.tr",
  [ValidateSet("true","false")]
  [string]$SmtpRejectUnauthorized = "true"
)

try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
  $OutputEncoding = [Console]::OutputEncoding
} catch {}

$dest = "$User@$HostName"

function Get-SshBaseArgs {
  $sshArgs = @("-p", "$Port",
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=NUL",
    "-o", "LogLevel=ERROR",
    "-o", "ConnectTimeout=30",
    "-o", "ConnectionAttempts=3",
    "-o", "ServerAliveInterval=15",
    "-o", "ServerAliveCountMax=3"
  )
  if ($IdentityFile -and $IdentityFile.Trim().Length -gt 0) {
    $sshArgs += @("-i", $IdentityFile)
  }
  return $sshArgs
}

function Invoke-RemoteSsh([string]$Command) {
  $base = Get-SshBaseArgs
  & ssh.exe @base $dest $Command 2>&1
}

function Send-File([string]$LocalPath, [string]$RemotePathFull) {
  $resolvedLocal = $LocalPath
  try { $resolvedLocal = (Get-Item -LiteralPath $LocalPath -ErrorAction Stop).FullName } catch {}

  # Ensure remote directory exists
  $remoteDir = ($RemotePathFull -replace '/[^/]+$','')
  if ($remoteDir -and $remoteDir.Trim().Length -gt 0) {
    Invoke-RemoteSsh "mkdir -p '$remoteDir'" | Out-Null
  }

  # Prefer scp: avoids sftp batch BOM issues on Windows PowerShell
  $scpArgs = @(
    "-P", "$Port",
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=NUL",
    "-o", "LogLevel=ERROR",
    "-o", "ConnectTimeout=30",
    "-o", "ConnectionAttempts=3",
    "-o", "ServerAliveInterval=15",
    "-o", "ServerAliveCountMax=3"
  )
  if ($IdentityFile -and $IdentityFile.Trim().Length -gt 0) {
    $scpArgs += @("-i", $IdentityFile)
  }

  $remoteSpec = "${dest}:$RemotePathFull"
  $out = & scp.exe @scpArgs "$resolvedLocal" "$remoteSpec" 2>&1
  if ($LASTEXITCODE -ne 0) {
    if ($out) { Write-Host $out }
    throw "SCP failed (exit $LASTEXITCODE)"
  }
}

function ConvertTo-EnvValue([string]$value) {
  if ($null -eq $value) { return "" }
  # .env double-quote safe escaping
  $v = $value -replace '\\', '\\\\'
  $v = $v -replace '"', '\"'
  $v = $v -replace "`r", ''
  $v = $v -replace "`n", '\n'
  return $v
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SETUP SMTP (SSH $Port)" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "RemotePath: $RemotePath" -ForegroundColor Gray
Write-Host "EnvFile: $EnvFileName" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "0) SSH connectivity..." -ForegroundColor Yellow
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) { Write-Host $ping; throw "SSH connection failed" }

if ($SmtpPass -and $SmtpPass.Trim().Length -gt 0) {
  Write-Host "1) Using SMTP_PASS from parameter (not printed)..." -ForegroundColor Yellow
  $plainPass = $SmtpPass
} else {
  Write-Host "1) Reading SMTP_PASS securely..." -ForegroundColor Yellow
  $securePass = Read-Host -AsSecureString "SMTP_PASS (for $SmtpUser)"
  $plainPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
  )
}

try {
  Write-Host "2) Uploading env snippet..." -ForegroundColor Yellow
  $tmpLocal = Join-Path $env:TEMP ("alo17-smtp-env-" + [Guid]::NewGuid().ToString("N") + ".env")
  $tmpRemote = "$RemotePath/.env.smtp.tmp"

  $lines = @(
    "# Added by SETUP_SMTP_2222.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "NEXT_PUBLIC_SITE_URL=`"$(ConvertTo-EnvValue $SiteUrl)`"",
    "SMTP_HOST=`"$(ConvertTo-EnvValue $SmtpHost)`"",
    "SMTP_PORT=`"$(ConvertTo-EnvValue $SmtpPort)`"",
    "SMTP_USER=`"$(ConvertTo-EnvValue $SmtpUser)`"",
    "SMTP_PASS=`"$(ConvertTo-EnvValue $plainPass)`"",
    "SMTP_FROM=`"$(ConvertTo-EnvValue $SmtpFrom)`"",
    "SMTP_REJECT_UNAUTHORIZED=`"$(ConvertTo-EnvValue $SmtpRejectUnauthorized)`"",
    "ADMIN_EMAIL=`"$(ConvertTo-EnvValue $AdminEmail)`"",
    "SUPPORT_EMAIL=`"$(ConvertTo-EnvValue $SupportEmail)`""
  )
  # IMPORTANT: write without BOM (some tools treat BOM as content)
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [IO.File]::WriteAllText($tmpLocal, ($lines -join "`n") + "`n", $utf8NoBom)

  Send-File -LocalPath $tmpLocal -RemotePathFull $tmpRemote | Out-Null

  Write-Host "3) Merging into $EnvFileName (create if missing)..." -ForegroundColor Yellow
  # Upload a small merge script to avoid SSH quoting issues
  $mergeScriptLocal = Join-Path $env:TEMP ("alo17-merge-env-" + [Guid]::NewGuid().ToString("N") + ".js")
  $mergeScriptRemote = "$RemotePath/.alo17-merge-env.js"

  $mergeScript = @"
const fs = require('fs');
const path = require('path');

const envFile = process.env.ALO17_ENV_FILE || '.env';
const target = path.join(process.cwd(), envFile);
const tmp = path.join(process.cwd(), '.env.smtp.tmp');

function extractKey(line) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  return m ? m[1] : null;
}

const additions = fs.existsSync(tmp) ? fs.readFileSync(tmp, 'utf8') : '';
const addLines = additions.split(/\r?\n/).filter(l => l.trim().length > 0 && !l.trim().startsWith('#'));
const addMap = new Map();
for (const l of addLines) {
  const k = extractKey(l);
  if (k) addMap.set(k, l);
}

const existing = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
const lines = existing.split(/\r?\n/);
const idx = new Map();
for (let i = 0; i < lines.length; i++) {
  const k = extractKey(lines[i]);
  if (k) idx.set(k, i);
}

for (const [k, v] of addMap.entries()) {
  if (idx.has(k)) lines[idx.get(k)] = v;
  else lines.push(v);
}

fs.writeFileSync(target, lines.join('\n').replace(/\n+$/, '\n'), 'utf8');
console.log('updated', target, 'keys:', Array.from(addMap.keys()).join(','));
"@

  [IO.File]::WriteAllText($mergeScriptLocal, $mergeScript, $utf8NoBom)
  Send-File -LocalPath $mergeScriptLocal -RemotePathFull $mergeScriptRemote | Out-Null

  $mergeCmd = "cd '$RemotePath' && ALO17_ENV_FILE='$EnvFileName' node '.alo17-merge-env.js' && rm -f '.env.smtp.tmp' '.alo17-merge-env.js'"
  Invoke-RemoteSsh $mergeCmd | ForEach-Object { $_ }

  # Verify key settings exist (do not print SMTP_PASS)
  $verifyCmd = "cd '$RemotePath' && grep -E '^(NEXT_PUBLIC_SITE_URL|SMTP_HOST|SMTP_PORT|SMTP_USER|SMTP_FROM|SMTP_REJECT_UNAUTHORIZED|ADMIN_EMAIL|SUPPORT_EMAIL)=' '$EnvFileName' || true"
  Invoke-RemoteSsh $verifyCmd | ForEach-Object { $_ }

  Write-Host "4) Rebuild + restart (pm2)..." -ForegroundColor Yellow
  Invoke-RemoteSsh "cd '$RemotePath' && npm run build && pm2 restart alo17 --update-env && pm2 save" | ForEach-Object { $_ }

  Write-Host ""
  Write-Host "✅ SMTP setup complete." -ForegroundColor Green
  Write-Host "Test SMTP status (admin required): $SiteUrl/api/test/smtp-check" -ForegroundColor Cyan
  Write-Host "Send test email: $SiteUrl/admin/test-email" -ForegroundColor Cyan
} finally {
  try { if ($tmpLocal -and (Test-Path -LiteralPath $tmpLocal)) { Remove-Item -LiteralPath $tmpLocal -Force } } catch {}
  try { if ($mergeScriptLocal -and (Test-Path -LiteralPath $mergeScriptLocal)) { Remove-Item -LiteralPath $mergeScriptLocal -Force } } catch {}
  # best-effort cleanup of sensitive plaintext
  $plainPass = $null
}

