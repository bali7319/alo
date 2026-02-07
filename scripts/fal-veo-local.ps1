param(
  [string]$ImagePath = "C:\Users\bali\Desktop\alo\public\images\placeholder.jpg",
  [string]$OutPath = "C:\Users\bali\Desktop\alo17-reels.mp4",
  [string]$AspectRatio = "9:16",
  [string]$Resolution = "1080p",
  [bool]$GenerateAudio = $false,
  [string]$Prompt = "Create a photorealistic 8-second vertical cinematic video from the provided image. Camera: slow push-in and gentle pan, stabilized motion, subtle parallax. Natural daytime colors, realistic lighting and reflections, subtle water movement, light breeze. Keep landmarks consistent with the input image. No text, no logos, no subtitles, no watermarks.",
  # Optional: pass key directly (not stored). Prefer env var if set.
  [string]$FalKey = ""
)

$ErrorActionPreference = "Stop"

function Get-MimeType([string]$path) {
  $ext = [IO.Path]::GetExtension($path).ToLowerInvariant()
  switch ($ext) {
    ".jpg" { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".png" { return "image/png" }
    ".webp" { return "image/webp" }
    default { return "application/octet-stream" }
  }
}

$falKey = if ($FalKey -and $FalKey.Trim() -ne "") { $FalKey } elseif ($env:FAL_KEY) { $env:FAL_KEY } elseif ($env:FAL_API_KEY) { $env:FAL_API_KEY } else { $null }
if (-not $falKey) {
  throw "FAL_KEY yok. PowerShell'de önce şunu çalıştır: `$env:FAL_KEY='KeyBuraya' (key'i paylaşmana gerek yok). Alternatif: script'i -FalKey parametresiyle çalıştır."
}

if (-not (Test-Path -LiteralPath $ImagePath)) {
  throw "Görsel bulunamadı: $ImagePath"
}

$bytes = [System.IO.File]::ReadAllBytes($ImagePath)
$b64 = [Convert]::ToBase64String($bytes)
$mime = Get-MimeType $ImagePath
$imageUrl = "data:$mime;base64,$b64"

$headers = @{
  Authorization = "Key $falKey"
  "Content-Type" = "application/json"
}

$bodyObj = @{
  prompt = $Prompt
  image_url = $imageUrl
  aspect_ratio = $AspectRatio
  resolution = $Resolution
  generate_audio = $GenerateAudio
}
$body = $bodyObj | ConvertTo-Json -Depth 8

Write-Host "1) Queue request..." -ForegroundColor Yellow
$resp = Invoke-RestMethod -Method Post -Uri "https://queue.fal.run/fal-ai/veo3.1/fast/image-to-video" -Headers $headers -Body $body

$statusUrl = $resp.status_url
$responseUrl = $resp.response_url
if (-not $statusUrl -or -not $responseUrl) {
  throw ("Beklenmeyen cevap: " + ($resp | ConvertTo-Json -Depth 8))
}

Write-Host "2) Waiting for completion..." -ForegroundColor Yellow
for ($i=0; $i -lt 200; $i++) {
  Start-Sleep -Seconds 3
  $st = Invoke-RestMethod -Method Get -Uri $statusUrl -Headers $headers
  if ($st.status -eq "COMPLETED") { break }
  if ($st.status -eq "FAILED") { throw ("Veo failed: " + ($st | ConvertTo-Json -Depth 8)) }
  Write-Host (" - " + $st.status) -ForegroundColor DarkGray
}

Write-Host "3) Fetch result..." -ForegroundColor Yellow
$out = Invoke-RestMethod -Method Get -Uri $responseUrl -Headers $headers
$videoUrl = $out.video.url
if (-not $videoUrl) { throw ("Video URL yok: " + ($out | ConvertTo-Json -Depth 8)) }

Write-Host "4) Downloading to $OutPath" -ForegroundColor Yellow
Invoke-WebRequest -Uri $videoUrl -OutFile $OutPath

Write-Host "Done." -ForegroundColor Green
Start-Process $OutPath

