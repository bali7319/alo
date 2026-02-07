<#
Deploy only SEO/canonical-related files to alo17 server (SSH 2222).

Usage (example):
  cd C:\Users\bali\Desktop\alo
  powershell -ExecutionPolicy Bypass -File .\scripts\deploy\DEPLOY_SEO_CANONICAL_2222.ps1 `
    -HostName "37.148.210.158" -User "root" -Port 2222 -IdentityFile "C:\Users\bali\20251973bscc20251973" `
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

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "sftp.exe"
    $psi.Arguments = @(
      "-P", "$Port",
      "-i", "$IdentityFile",
      "-o", "StrictHostKeyChecking=no",
      "-o", "UserKnownHostsFile=NUL",
      "-o", "BatchMode=yes",
      "-o", "ConnectTimeout=30",
      "-o", "ConnectionAttempts=3",
      "-o", "ServerAliveInterval=15",
      "-o", "ServerAliveCountMax=3",
      "-b", "-",
      "$dest"
    ) -join " "
    $psi.RedirectStandardInput = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true

    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $psi
    [void]$p.Start()
    $p.StandardInput.Write($batch)
    $p.StandardInput.Close()

    if ($p.WaitForExit(60000)) {
      $out = $p.StandardOutput.ReadToEnd() + $p.StandardError.ReadToEnd()
      if ($p.ExitCode -eq 0) { return }
      Write-Host $out
    } else {
      try { $p.Kill() } catch {}
      Write-Host "SFTP timeout (60s) for $LocalPath" -ForegroundColor Yellow
    }

    if ($attempt -lt $maxAttempts) {
      Write-Host "Retry ($attempt/$maxAttempts) for $LocalPath ..." -ForegroundColor Yellow
      Start-Sleep -Seconds (3 * $attempt)
    }
  }

  throw "SFTP failed for $LocalPath"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DEPLOY SEO CANONICAL (SSH 2222)" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "RemotePath: $RemotePath" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "0) SSH connectivity..." -ForegroundColor Yellow
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) { Write-Host $ping; throw "SSH connection failed" }

Write-Host "1) Copying files..." -ForegroundColor Yellow

$files = @(
  @{ local = ".\\src\\lib\\slug.ts"; remote = "$RemotePath/src/lib/slug.ts" },
  @{ local = ".\\src\\app\\sitemap.ts"; remote = "$RemotePath/src/app/sitemap.ts" },
  @{ local = ".\\src\\app\\ilan\\[id]\\page.tsx"; remote = "$RemotePath/src/app/ilan/[id]/page.tsx" },
  @{ local = ".\\src\\app\\ilan\\[id]\\sikayet\\page.tsx"; remote = "$RemotePath/src/app/ilan/[id]/sikayet/page.tsx" },
  @{ local = ".\\src\\app\\ilan\\[id]\\sikayet\\layout.tsx"; remote = "$RemotePath/src/app/ilan/[id]/sikayet/layout.tsx" },
  @{ local = ".\\src\\app\\ilan\\[id]\\yorumlar\\layout.tsx"; remote = "$RemotePath/src/app/ilan/[id]/yorumlar/layout.tsx" },
  @{ local = ".\\src\\app\\api\\listings\\[id]\\route.ts"; remote = "$RemotePath/src/app/api/listings/[id]/route.ts" },
  @{ local = ".\\src\\components\\listing-card.tsx"; remote = "$RemotePath/src/components/listing-card.tsx" },
  @{ local = ".\\src\\components\\featured-ads.tsx"; remote = "$RemotePath/src/components/featured-ads.tsx" },
  @{ local = ".\\src\\components\\latest-ads.tsx"; remote = "$RemotePath/src/components/latest-ads.tsx" },
  @{ local = ".\\src\\app\\ilanlarim\\page.tsx"; remote = "$RemotePath/src/app/ilanlarim/page.tsx" },
  @{ local = ".\\src\\app\\favorilerim\\page.tsx"; remote = "$RemotePath/src/app/favorilerim/page.tsx" },
  @{ local = ".\\src\\app\\profil\\page.tsx"; remote = "$RemotePath/src/app/profil/page.tsx" },
  @{ local = ".\\src\\app\\admin\\sikayetler\\page.tsx"; remote = "$RemotePath/src/app/admin/sikayetler/page.tsx" },
  @{ local = ".\\src\\app\\moderator\\page.tsx"; remote = "$RemotePath/src/app/moderator/page.tsx" },
  @{ local = ".\\src\\lib\\email.ts"; remote = "$RemotePath/src/lib/email.ts" },
  @{ local = ".\\src\\app\\ilan-ver\\duzenle\\[id]\\page.tsx"; remote = "$RemotePath/src/app/ilan-ver/duzenle/[id]/page.tsx" }
)

foreach ($f in $files) {
  if (-not (Test-Path -LiteralPath $f.local)) {
    Write-Host " ! skipping missing local file: $($f.local)" -ForegroundColor Yellow
    continue
  }
  Write-Host " - $($f.local) -> $($f.remote)" -ForegroundColor Gray
  Put-File -LocalPath $f.local -RemotePathFull $f.remote | Out-Null
}

Write-Host "2) Rebuild + restart (pm2)..." -ForegroundColor Yellow
Invoke-RemoteSsh "cd '$RemotePath' && npm run build && pm2 restart alo17 && pm2 save" | ForEach-Object { $_ }

Write-Host ""
Write-Host "✅ Deploy completed." -ForegroundColor Green
Write-Host "Test: https://alo17.tr/sitemap.xml" -ForegroundColor Cyan

