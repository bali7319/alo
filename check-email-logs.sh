#!/bin/bash
# Email loglarını kontrol et

echo "=========================================="
echo "EMAIL LOGLARI KONTROL EDILIYOR"
echo "=========================================="
echo ""

echo "Son 200 satir log (email ile ilgili):"
pm2 logs alo17 --lines 200 --nostream | grep -i -E "(email|smtp|📧|❌|gönder|hata|error)" || echo "Email ile ilgili log bulunamadi"

echo ""
echo "=========================================="
echo "TUM SON LOGLAR:"
echo "=========================================="
pm2 logs alo17 --lines 50 --nostream

