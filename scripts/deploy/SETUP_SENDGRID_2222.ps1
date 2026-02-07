# Setup SendGrid (HTTPS relay) env vars on alo17 server (SSH 2222) and restart pm2.
#
# Usage:
#   cd C:\Users\bali\Desktop\alo
#   powershell -ExecutionPolicy Bypass -File .\scripts\deploy\SETUP_SENDGRID_2222.ps1 -HostName "alo17.tr" -IdentityFile "C:\Users\bali\20251973bscc20251973"
#
# Notes:
# - Prompts securely for SENDGRID_API_KEY if not provided.
# - Writes keys into `$RemotePath/.env` (or EnvFileName).
# - Does NOT print the API key.

param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,
  [string]$User = "root",
  [int]$Port = 2222,
  [Parameter(Mandatory = $true)]
  [string]$IdentityFile,
  [string]$RemotePath = "/var/www/alo17",
  [string]$EnvFileName = ".env",

  [string]$SendGridApiKey = "",
  [string]$SendGridFrom = "destek@alo17.tr",
  [string]$SendGridFromName = "Alo17"
)

try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
  $OutputEncoding = [Console]::OutputEncoding
} catch {}

$dest = "$User@$HostName"

function Get-SshArgs {
  return @(
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
}

function Invoke-RemoteSsh([string]$Command) {
  $sshArgs = Get-SshArgs
  & ssh.exe @sshArgs $dest $Command 2>&1
}

function Send-File([string]$LocalPath, [string]$RemotePathFull) {
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
    throw "SCP failed (exit $LASTEXITCODE)"
  }
}

function ConvertTo-EnvValue([string]$value) {
  if ($null -eq $value) { return "" }
  $v = $value -replace '\\', '\\\\'
  $v = $v -replace '"', '\"'
  $v = $v -replace "`r", ''
  $v = $v -replace "`n", '\n'
  return $v
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SETUP SENDGRID (SSH $Port)" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "RemotePath: $RemotePath" -ForegroundColor Gray
Write-Host "EnvFile: $EnvFileName" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "0) SSH connectivity..." -ForegroundColor Yellow
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) { Write-Host $ping; throw "SSH connection failed" }

if ($SendGridApiKey -and $SendGridApiKey.Trim().Length -gt 0) {
  Write-Host "1) Using SENDGRID_API_KEY from parameter (not printed)..." -ForegroundColor Yellow
  $plainKey = $SendGridApiKey
} else {
  Write-Host "1) Reading SENDGRID_API_KEY securely..." -ForegroundColor Yellow
  $secureKey = Read-Host -AsSecureString "SENDGRID_API_KEY"
  $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
  )
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$tmpLocal = $null
$mergeScriptLocal = $null

try {
  Write-Host "2) Uploading env snippet..." -ForegroundColor Yellow
  $tmpLocal = Join-Path $env:TEMP ("alo17-sendgrid-env-" + [Guid]::NewGuid().ToString("N") + ".env")
  $tmpRemote = "$RemotePath/.env.sendgrid.tmp"

  $lines = @(
    "# Added by SETUP_SENDGRID_2222.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "SENDGRID_API_KEY=`"$(ConvertTo-EnvValue $plainKey)`"",
    "SENDGRID_FROM=`"$(ConvertTo-EnvValue $SendGridFrom)`"",
    "SENDGRID_FROM_NAME=`"$(ConvertTo-EnvValue $SendGridFromName)`""
  )
  [IO.File]::WriteAllText($tmpLocal, ($lines -join "`n") + "`n", $utf8NoBom)
  Send-File -LocalPath $tmpLocal -RemotePathFull $tmpRemote | Out-Null

  Write-Host "3) Merging into $EnvFileName (create if missing)..." -ForegroundColor Yellow
  $mergeScriptLocal = Join-Path $env:TEMP ("alo17-merge-sendgrid-" + [Guid]::NewGuid().ToString("N") + ".js")
  $mergeScriptRemote = "$RemotePath/.alo17-merge-sendgrid.js"

  $mergeScript = @"
const fs = require('fs');
const path = require('path');
const envFile = process.env.ALO17_ENV_FILE || '.env';
const target = path.join(process.cwd(), envFile);
const tmp = path.join(process.cwd(), '.env.sendgrid.tmp');
function key(line){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);return m?m[1]:null;}
const additions = fs.existsSync(tmp) ? fs.readFileSync(tmp,'utf8') : '';
const addLines = additions.split(/\r?\n/).filter(l=>l.trim().length>0 && !l.trim().startsWith('#'));
const addMap = new Map();
for(const l of addLines){const k=key(l); if(k) addMap.set(k,l);}
const existing = fs.existsSync(target) ? fs.readFileSync(target,'utf8') : '';
const lines = existing.split(/\r?\n/);
const idx = new Map();
for(let i=0;i<lines.length;i++){const k=key(lines[i]); if(k) idx.set(k,i);}
for(const [k,v] of addMap.entries()){ if(idx.has(k)) lines[idx.get(k)] = v; else lines.push(v); }
fs.writeFileSync(target, lines.join('\n').replace(/\n+$/,'\n'), 'utf8');
console.log('updated', target, 'keys:', Array.from(addMap.keys()).join(','));
"@

  [IO.File]::WriteAllText($mergeScriptLocal, $mergeScript, $utf8NoBom)
  Send-File -LocalPath $mergeScriptLocal -RemotePathFull $mergeScriptRemote | Out-Null

  $mergeCmd = "cd '$RemotePath' && ALO17_ENV_FILE='$EnvFileName' node '.alo17-merge-sendgrid.js' && rm -f '.env.sendgrid.tmp' '.alo17-merge-sendgrid.js'"
  Invoke-RemoteSsh $mergeCmd | ForEach-Object { $_ }

  # Verify (do not print API key)
  $verifyCmd = "cd '$RemotePath' && grep -E '^(SENDGRID_FROM|SENDGRID_FROM_NAME)=' '$EnvFileName' || true"
  Invoke-RemoteSsh $verifyCmd | ForEach-Object { $_ }

  Write-Host "4) Rebuild + restart (pm2)..." -ForegroundColor Yellow
  Invoke-RemoteSsh "cd '$RemotePath' && npm run build && pm2 restart alo17 --update-env && pm2 save" | ForEach-Object { $_ }

  Write-Host ""
  Write-Host "✅ SendGrid setup complete." -ForegroundColor Green
  Write-Host "Test provider: https://alo17.tr/api/test/smtp-check" -ForegroundColor Cyan
  Write-Host "Send test email: https://alo17.tr/admin/test-email" -ForegroundColor Cyan
} finally {
  try { if ($tmpLocal -and (Test-Path -LiteralPath $tmpLocal)) { Remove-Item -LiteralPath $tmpLocal -Force } } catch {}
  try { if ($mergeScriptLocal -and (Test-Path -LiteralPath $mergeScriptLocal)) { Remove-Item -LiteralPath $mergeScriptLocal -Force } } catch {}
  $plainKey = $null
}

