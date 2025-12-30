# Favicon 504 Fix - Update Nginx Configuration
Write-Host "Fixing favicon 504 error..." -ForegroundColor Green

# Copy file to server
Write-Host "Copying nginx config to server..." -ForegroundColor Yellow
scp nginx-site-config.conf root@alo17.tr:/etc/nginx/sites-available/alo17.tr

if ($LASTEXITCODE -eq 0) {
    Write-Host "File copied successfully!" -ForegroundColor Green
    
    # Test and reload nginx
    Write-Host "Testing and reloading nginx..." -ForegroundColor Yellow
    ssh root@alo17.tr "nginx -t; if (`$?) { systemctl reload nginx; echo 'Nginx reloaded successfully' } else { echo 'Nginx test failed' }"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Success! Favicon 504 error fixed!" -ForegroundColor Green
        Write-Host "Test: https://alo17.tr/favicon.ico" -ForegroundColor Cyan
    } else {
        Write-Host "Nginx reload error!" -ForegroundColor Red
    }
} else {
    Write-Host "File copy error! Check SSH connection." -ForegroundColor Red
    Write-Host "You may need to enter SSH password or use SSH key." -ForegroundColor Yellow
}
