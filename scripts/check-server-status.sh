#!/bin/bash
# Sunucu durumunu kontrol et

echo "🔍 PM2 Durumu:"
pm2 status

echo ""
echo "📋 Son 50 Log Satırı:"
pm2 logs alo17 --lines 50 --nostream

echo ""
echo "🔌 Port Kontrolü (3000):"
netstat -tulpn | grep 3000 || echo "Port 3000 kullanılmıyor"

echo ""
echo "💾 Memory Durumu:"
free -h

echo ""
echo "🔄 Node Process'leri:"
ps aux | grep node | grep -v grep

