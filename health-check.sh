#!/bin/bash
# Otomatik Health Check ve Restart Script'i
# Site erişilemezse otomatik restart yapar

HEALTH_URL="http://localhost:3000/api/health"
MAX_RETRIES=3
RETRY_DELAY=10
LOG_FILE="/var/www/alo17/logs/health-check.log"
APP_DIR="/var/www/alo17"

# Log fonksiyonu
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Health check fonksiyonu
check_health() {
    local retry_count=0
    local is_healthy=false
    
    while [ $retry_count -lt $MAX_RETRIES ] && [ "$is_healthy" = false ]; do
        retry_count=$((retry_count + 1))
        log_message "Health check denemesi $retry_count/$MAX_RETRIES..."
        
        if curl -f -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" | grep -q "200"; then
            log_message "✅ Site saglikli (HTTP 200)"
            is_healthy=true
            return 0
        else
            log_message "❌ Health check basarisiz (deneme $retry_count)"
            if [ $retry_count -lt $MAX_RETRIES ]; then
                sleep $RETRY_DELAY
            fi
        fi
    done
    
    return 1
}

# Ana işlem
log_message "=== Health Check Basladi ==="

# Health check yap
if check_health; then
    log_message "✅ Site saglikli, herhangi bir islem yapilmadi"
    exit 0
fi

# Site sağlıklı değilse restart yap
log_message "⚠️  Site saglikli degil, restart yapiliyor..."

# PM2 restart
log_message "1. PM2 restart yapiliyor..."
cd "$APP_DIR" || exit 1
pm2 restart alo17 >> "$LOG_FILE" 2>&1
pm2 save >> "$LOG_FILE" 2>&1

# Nginx reload
log_message "2. Nginx reload yapiliyor..."
systemctl reload nginx >> "$LOG_FILE" 2>&1

# 10 saniye bekle
log_message "3. 10 saniye bekleniyor..."
sleep 10

# Tekrar health check
log_message "4. Tekrar health check yapiliyor..."
if curl -f -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" | grep -q "200"; then
    log_message "✅ Site restart sonrasi saglikli (HTTP 200)"
    exit 0
else
    log_message "❌ Site hala erisilebilir degil - Manuel kontrol gerekli!"
    exit 1
fi

