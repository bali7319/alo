Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SMTP AYARLARI (GUVENLI) - Alo17" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bu dosyada daha once SMTP sifresi hard-code edilmis olabilecegi icin" -ForegroundColor Yellow
Write-Host "guvenlik amaciyla kaldirildi." -ForegroundColor Yellow
Write-Host ""
Write-Host "SMTP kurulumunu su script ile yapin (sifreyi guvenli sorar):" -ForegroundColor White
Write-Host "  .\SMTP_SETUP_2222.bat" -ForegroundColor Green
Write-Host "  veya" -ForegroundColor White
Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\deploy\SETUP_SMTP_2222.ps1" -ForegroundColor Green
Write-Host ""
Write-Host "Sonra test:" -ForegroundColor White
Write-Host "  /api/test/smtp-check" -ForegroundColor Green
Write-Host "  /admin/test-email" -ForegroundColor Green

